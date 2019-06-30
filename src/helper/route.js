const fs = require('fs');
const path = require('path');
const promisify = require('util').promisify;
const stat = promisify(fs.stat);
const readdir = promisify(fs.readdir);
const Handlebars = require('handlebars');
const soruce = fs.readFileSync(path.join(__dirname,'../template/dir.tpl'));
const template = Handlebars.compile(soruce.toString());
const compress = require('../helper/compress');
module.exports = async function (req,res,filePath,config) {
  try {
      const stats = await stat(filePath);
      if(stats.isFile())
      {
          res.statusCode=200;
          res.setHeader("Content-Type",'text/plain');
          let rs = fs.createReadStream(filePath);
          if(filePath.match(config.compress))
          {
              rs=compress(rs,req,res);
          }
          rs.pipe(res);
      }
      else if(stats.isDirectory())
      {
          const files = await readdir(filePath);
          console.log(files);
          const dir = path.relative(config.root,filePath);
          const data ={
              title:path.basename(filePath),
              dir:dir?`/${dir}`:'',
              files
          };
          res.statusCode=200;
          res.setHeader("Content-Type",'text/html');
          res.end(template(data));
      }

  }
  catch (ex) {
      res.statusCode=404;
      res.setHeader("Content-Type",'text/plain');
      res.end(`${filePath} is not a directory or file\n ${ex.toString()}`);
  }
};

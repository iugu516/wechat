// 引入mongoose
const mongoose = require('mongoose');
// 引入配置文件
const config = require('./config.js');

// 获取config中的参数
const ip = config.ip;
const port = config.port;
const dbName = config.dbName;

// 连接数据库
const url = 'mongodb://'+ip+':'+port+'/'+dbName;
// console.log(url);
mongoose.connect(url,{useNewUrlParser:true});

// 创建Schema
const schema = mongoose.Schema;

// 暴露
module.exports = {
  schema:schema,
  mongoose:mongoose
}

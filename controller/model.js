// 调用myModel，连接数据库，获取由Schema编译得到的User和Message这两个model

// 引入myModel，用于操作数据库
var db = require('../model/myModel');

// 获取Schema和mongoose
var Schema = db.Schema;
var mongoose = db.mongoose;
// 创建Schema(users用户集合,message留言集合)
var userSchema = new Schema({
  username:String,
  nickname:String,
  password:String,
  photo:String
});
var msgSchema = new Schema({
  username:String,
  nickname:String,
  message:String,
  time:String
},{collection:'message',versionKey:false});
// 创建model
var User = mongoose.model('user',userSchema);
var Message = mongoose.model('msg',msgSchema);


module.exports = {
  User:User,
  Message:Message,
  db:db
}

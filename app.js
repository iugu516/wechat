// 启动服务器，接收请求
var express = require('express');
// 引入路由
var router = require('./controller');
var session = require('express-session');
var bodyParser = require('body-parser');
var app = express();

app.listen(4000);

// 设置视图模板引擎
app.set('view engine','ejs');

// 设置根目录
app.use(express.static('./public'));
app.use(express.static('./touxiang'));
app.use(express.static('./uploads'));

app.use(session({
  secret:'message',
  resave: true,
  saveUninitialized: false,
  cookie: {maxAge: 10000000000}
}));

app.use(bodyParser.urlencoded({extended:true}));

// 登录验证
app.use(router.checkIsLogin);

// 接收/请求，展示首页
app.get('/',router.showIndex);

// 接收get方式/add请求，发表留言
app.get('/add',router.add);

// 接收get /del?id=xxx ，删除留言
app.get('/del',router.del);

// /modify 接收ajax的请求
app.get('/modify',router.modify);

// /toRegist 请求，跳转到注册页面
app.get('/toRegist',router.toRegist);

// /checkName请求，检查用户名是否可用
app.get('/checkName',router.checkName);

// /regist请求，注册账户
app.get('/regist',router.doRegist);

// /toLogin，跳转到登录页面
app.get('/toLogin',router.toLogin);

// post请求 /login，登录
app.post('/login',router.doLogin);

// 退出登录
app.get('/logout',router.logout);

// /personCenter，跳转到个人中心页面
app.get('/personCenter',router.toCenter);

// /checkNickname，检查昵称是否存在
app.get('/checkNickname',router.checkNickname);

// /toUpdatePwd，跳转到修改密码页面
app.get('/toUpdatePwd',router.toUpdatePwd);

// POST的/updatePwd 修改密码
app.post('/updatePwd',router.updatePwd);

// /toUpload请求，跳转到上传头像页面
app.get('/toUpload',router.toUpload);

// post/upload请求，上传图片
app.post('/upload',router.upload);

// /cut请求，剪切图片
app.get('/cut',router.cut);
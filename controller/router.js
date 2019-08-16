// 处理浏览器发送的请求
var sd = require('silly-datetime');
var fd = require('formidable');
var fs = require('fs');
var gm = require('gm');
var md5 = require('../model/myMD5.js');
// 引入model获取数据库相关数据
var model = require('./model.js');
var db = model.db;
var User = model.User;
var Message = model.Message;
var ObjectId = db.mongoose.Types.ObjectId;


// 处理/请求，展示所有留言数据
exports.showIndex = function(req,res){
  // ****不分页，一次性显示所有数据(index.ejs)****
  // 获取登录的用户名
  var username = req.session.username;
  // 获取数据库中所有的留言信息，将其传递给浏览器
  db.find(Message,{limit:0},function(err,docs){
    if(err){
      console.log(err);
      res.render('error',{status:1,errMsg:'查询数据失败'});
      return ;
    }
    // console.log(docs.length);
    // 将数据发送给页面
    // res.render('index',{msg:docs,username:username});
    // 还需要返回所有用户的信息
    db.find(User,{},{limit:0},function(err,users){
      if(err){
        console.log(err);
        res.render('error',{status:1,errMsg:'查询数据失败'});
        return ;
      }
      // 返回数据：所有留言、登录信息、所有用户信息
      res.render('index',{msg:docs,username:username,users:users});
    })
  });
}

// 处理get 的/add 请求，获取输入的数据，将其保存进数据库
exports.add = function(req,res){
  // 获取参数
  var query = req.query; //{message:'xx'}
  // 获取登录信息
  var username = req.session.username;
  query.username = username;
  query.time = sd.format(new Date());
  // 获取username对应的nickname
  db.find(User,{username:username},function(err,docs){
    if(err){
      console.log(err);
      res.render('error',{status:0,errMsg:'保存留言失败！'});
      return ;
    }
    // 获取User中的nickname，如果为空，则替换为用户名
    var nickname = docs[0].nickname||username;
    query.nickname = nickname;
    // 保存进数据库
    db.add(Message,query,function(err){
      if(err){
        console.log(err);
        res.render('error',{status:0,errMsg:'保存留言失败！'});
        return ;
      }
      res.redirect('/');
    })
  })
}

// /del请求，删除被点击的留言
exports.del = function(req,res){
  var id = req.query.id;
  id = ObjectId(id);
  db.del(Message,{_id:id},function(err){
    if(err){
      console.log(err);
      res.render('error',{status:0,errMsg:'删除留言失败！'});
      return ;
    }
    res.redirect('/');
  })
}

// /modify
exports.modify = function(req,res){
  var id = req.query.id;
  var val = req.query.val;
  id = ObjectId(id);
  var data = {message:val};
  var filter = {_id:id};
  // res.send('123aabbcc');
  db.modify(Message,filter,data,function(err){
    if(err){
      console.log(err);
      res.send('error');
      return ;
    }
    res.send('success');
  })

}

// /toRegist请求，跳转到注册页面
exports.toRegist = function(req,res){
  res.render('regist');
}

// /checkName，检查用户名
exports.checkName = function(req,res){
  // 获取用户名
  var username = req.query.username;
  // 查询数据库中是否包含username的数据
  db.find(User,{username:username},function(err,docs){
    if(err){
      console.log(err);
      res.send({status:2,msg:'网络出错'});
      return ;
    }
    // 判断docs有没有元素
    if(docs.length>0){
      // 说明有数据，用户名存在
      res.send({status:1,msg:'用户名已存在'});
      return ;
    }
    // 用户名不存在
    res.send({status:0,msg:'用户名可用'});
  });
}


// /regist请求，注册账户，将用户名密码等信息保存进数据库
exports.doRegist = function(req,res){
  var query = req.query;//{username:'xx',password:'xx'}
  query.nickname = '';
  query.photo = '/img/photo.gif';
  // 检查username和password的合法性
  var username = query.username;
  var password = query.password;
  if(username==undefined||password==undefined){
    res.send({status:3,msg:'用户名密码不合法'});
    return ;
  }
  if(username.trim()==''||password.trim()==''){
    res.send({status:4,msg:'用户名密码不能全是空格'});
    return ;
  }
  // 判断username是否存在
  db.find(User,{username:username},function(err,docs){
    if(err){
      console.log(err);
      res.send({status:2,msg:'网络出错'});
      return ;
    }
    if(docs.length>0){
      res.send({status:1,msg:'用户名已存在'});
      return ;
    }
    // 用户名可用，保存进数据库
    // 对密码加密
    query.password = md5.encryption(query.password);
    db.add(User,query,function(err){
      if(err){
        console.log(err);
        res.send({status:2,msg:'网络出错'});
        return ;
      }
      // 保存成功
      // 保存登录的用户信息
      req.session.username = username;
      res.send({status:0,msg:'注册成功'});
    });
  })
}

// /toLogin，跳转到登录页面
exports.toLogin = function(req,res){
  res.render('login');
}

// post请求/login，登录操作
exports.doLogin = function(req,res){
  // 获取请求参数
  var body = req.body;// {username:'xx',password:'xx'}
  // 对密码加密
  body.password = md5.encryption(body.password);
  // 查找是否有符合的数据
  db.find(User,body,function(err,docs){
    if(err){
      console.log(err);
      res.render('error',{status:0,errMsg:'登录失败'});
      return ;
    }
    if(docs.length==0){
      res.render('error',{status:0,errMsg:'用户名或密码错误'});
      return ;
    }
    // 登录成功，保存session
    req.session.username = body.username;
    // 跳转到首页
    res.redirect('/');
  });

}

// 验证是否已经登录
// 登录了，请求放行，未登录，除部分请求外，都要拦截
exports.checkIsLogin = function(req,res,next){
  // 获取请求地址
  // console.log(req);
  var url = req._parsedUrl.pathname;
  // 放行条件:
  // 已经登录了，/toRegist,/checkName,/regist,/toLogin,/login
  // 已经登录，session有值
  var username = req.session.username;
  if(username||url=='/toRegist'||url=='/checkName'||url=='/regist'||url=='/toLogin'||url=='/login'){
    // 放行
    next();
  }else{
    // 未登录，不放行
    // res.redirect('/toLogin');
    res.render('login');
  }
}

// /logout请求，退出当前登录状态(删除session)
exports.logout = function(req,res){
  req.session.destroy(function(err){
    if(err){
      console.log(err);
      res.render('error',{status:0,errMsg:'退出失败'});
      return ;
    }
    // 退出成功
    res.redirect('/');
  })
}
// /personCenter请求，跳转到个人中心页面
exports.toCenter = function(req,res){
  // 获取当前登录用户的所有信息
  var username = req.session.username;
  db.find(User,{username:username},function(err,docs){
    if(err){
      console.log(err);
      res.render('error',{status:0,errMsg:'网络错误'});
      return ;
    }
    // 返回数据
    res.render('person',{p:docs[0]});
  })
}

// /checkNickname,修改昵称
exports.checkNickname = function(req,res){
  var username = req.session.username;
  var nickname = req.query.nickname;
  db.find(User,{nickname:nickname},function(err,docs){
    if(err){
      console.log(err);
      res.send({status:1,msg:'网络错误，稍后再试'});
      return ;
    }
    if(docs.length>0){
      res.send({status:1,msg:'昵称已存在，请换一个'});
      return ;
    }
    // 没有昵称，可以用(可以到数据库中去修改原来的昵称)
    var filter = {username:username};
    var data = {nickname:nickname};
    db.modify(User,filter,data,function(err){
      if(err){
        console.log(err);
        res.send({status:1,msg:'网络错误，修改失败'});
        return ;
      }
      // 修改成功
      res.send({status:0,msg:'修改成功'});
    })
  })
}

// /toUpdatePwd，跳转到修改密码页面
exports.toUpdatePwd = function(req,res){
  res.render('updatePwd');
}

// /updatePwd，修改密码
exports.updatePwd = function(req,res){
  // 获取必要的数据username,password
  var username = req.session.username;
  // 获取页面传递回来的数据：旧面，新密码
  var password = req.body.password;
  var nPwd = req.body.nPwd;
  password = md5.encryption(password);//加密
  // 查询username所对应的用户信息
  db.find(User,{username:username},function(err,docs){
    if(err){
      console.log(err);
      res.render('error',{status:0,errMsg:'查询失败'});
      return ;
    }
    if(docs.length==0){
      res.render('error',{status:0,errMsg:'登录失效'});
      return ;
    }
    // 输入的密码与数据库中的密码是否一致
    if(docs[0].password!=password){
      // 不一样，输入的旧密码错误
      res.render('error',{status:0,errMsg:'旧密码输入错误'});
      return ;
    }
    // 旧密码一致，对新密码进行加密，并更新数据库信息
    nPwd = md5.encryption(nPwd);
    var filter = {username:username};
    var data = {password:nPwd};
    db.modify(User,filter,data,function(err){
      if(err){
        console.log(err);
        res.render('error',{status:0,errMsg:'修改失败'});
        return ;
      }
      // 修改成功，重新登录
      req.session.destroy(function(err){
        if(err){
          console.log(err);
        }
        res.redirect('/');
      });
    });
  });
}

// /toUpload
exports.toUpload = function(req,res){
  res.render('upload');
};

// /upload上传图片
exports.upload = function(req,res){
  // 获取用户名
  var username = req.session.username;
  // 获取form表单
  var form = new fd.IncomingForm();
  // 设置临时保存路径
  form.uploadDir = './uploads';
  // 解析请求
  form.parse(req,function(err,fields,files){
    if(err){
      console.log(err);
      res.render('error',{status:0,errMsg:'上传失败'});
      return ;
    }
    // 获取上传的图片
    var pic = files.pic;
    // 获取图片的基本信息
    var path = pic.path; // 旧路径
    var name = pic.name; // 文件名
    var arr = name.split('.');
    var ext = arr[arr.length-1];//后缀名
    // 图片的新名称 xxx.jpg
    var newName = username+'.'+ext;
    // 新路径(临时保存上传图片的位置，真正的头像保存在touxiang文件夹中)
    var newPath = './uploads/'+newName;
    fs.rename(path,newPath,function(err){
      if(err){
        console.log(err);
        res.render('error',{status:0,errMsg:'上传失败'});
        return ;
      }
      // 上传成功，跳转到剪切的页面
      res.render('cut',{path:newName});
    });
  })
}

// /cut剪切图片
exports.cut = function(req,res){
  var username = req.session.username;
  var w = parseInt(req.query.w);
  var h = parseInt(req.query.h);
  var x = parseInt(req.query.x);
  var y = parseInt(req.query.y);
  var img = req.query.img; // xxx.jpg
  // 剪切图片
  var photo = './touxiang/'+img;
  gm('./uploads/'+img).crop(w,h,x,y).write(photo,function(err){
    if(err){
      console.log(err);
      res.send({status:1,msg:'剪切失败'});
      return ;
    }
    // res.send({status:0,msg:'剪切成功'});
    // 将最新图片路径保存进数据库
    var filter = {username:username};
    var data = {photo:img};
    db.modify(User,filter,data,function(err){
      if(err){
        console.log(err);
        res.send({status:1,msg:'网络错误'});
        return ;
      }
      res.send({status:0,msg:'剪切成功'});
    });
  });
}

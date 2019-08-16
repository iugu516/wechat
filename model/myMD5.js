// 自定义一个加密模块
var crypto = require('crypto');

exports.encryption = function(str){
  if(str==undefined){
    return null;
  }
  if(typeof str !== 'string'){
    throw new Error('参数必须为字符串');
  }
  if(str.trim()==''){
    return '';
  }
  // 加密
  str = 
  crypto.createHash('md5').update(str).digest('base64');
  // console.log(str);
  str = str.substring(3,str.length-6);
  // console.log(str);

  str = str.toUpperCase();

  str = 
  crypto.createHash('md5').update(str).digest('base64');
  return str;
}



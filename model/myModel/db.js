// 封装数据库增删改查的基本操作，方便以后直接调用
// 引入schema.js
const db = require('./schema.js');

// 增
/**
 * 添加数据到数据库
 * @param {*} model 通过Schema创建出来对应的Model
 * @param {JSON} json 将要保存的数据
 * @param {Function} callback 回调函数
 */
function add(model,json,callback){
  // 使用model创建对象
  var o = new model(json);
  o.save(function(err){
    callback(err);
  });
}

// 删
/**
 * 根据给定的条件删除指定集合中的数据
 * @param {*} model 通过Schema创建出来对应的Model
 * @param {JSON} filter 删除的条件
 * @param {Function} callback 回调
 */
function del(model,filter,callback){
  model.deleteOne(filter,function(err){
    callback(err);
  });
}

// 改
/**
 * 根据给定条件和数据修改指定集合中的数据
 * @param {*} model 通过Schema创建出来对应的Model
 * @param {JSON} filter 修改的条件
 * @param {JSON} json 修改的数据
 * @param {Function} callback 回调
 */
function modify(model,filter,json,callback){
  model.updateOne(filter,{$set:json},function(err,raw){
    callback(err,raw);
  });
}

// 查
/**
 * 查询数据
 * @param {*} model 通过Schema创建出来对应的Model
 * @param {JSON} [filter] 查询的条件
 * @param {JSON} [options] 选项
 * @param {Function} callback 回调
 */
function find(model,filter,options,callback){
  if(arguments.length==2){
    callback = filter;
    filter = {};
    options = {page:1,limit:5};
  }
  if(arguments.length==3){
    callback = options;
    // 判断第二个参数filter中是否包含以下三个属性中任意一个
    // 如果有，则表示filter实际上是一个options
    if(!(filter.hasOwnProperty("page")||filter.hasOwnProperty("limit")||filter.hasOwnProperty("sort"))){
      // 不是options
      options = {page:1,limit:5};
    }else{
      // 含有其中某一个或多个属性
      options.page = 
          (filter.page<=0?1:filter.page) || 1; // 获取第几页
      options.limit = filter.limit; // 获取每页数目
      
      options.sort = filter.sort || {}; // 排序方式
      filter = {}; // 无条件查询
    }
  }

  // 处理options中的数据
  var limit = 
    options.limit===undefined?5:options.limit;
  var page = options.page || 1;
  var skip = (page-1)*limit;
  var sort = options.sort || {};
  // 判断数据库中的数据够不够
  countAll(model,filter,function(err,count){
    if(err){
      callback(err,null);
      return ;
    }
    var totalPage = Math.ceil(count/limit); // 总页数
    if(page>totalPage){
      // 当输入的页码超过总页数时
      page = totalPage;// 将其重置为最后一页
      if(page==0){ // 如果总页数为0(没有数据)
        // 将page重置为1(防止下一步 -1 变为负数)
        page = 1;
      }
      skip = (page-1)*limit;// 重新计算跳过的条数
    }
    var ops = {limit:limit,skip:skip,sort:sort};
    // 查询
    model.find(filter,null,ops,function(err,docs){
      callback(err,docs);
    });
  });

}
/**
 * 获取某个集合中所有数据的数目
 * @param {*} model 
 * @param {JSON} filter 统计的条件
 * @param {Function} callback 
 */
function countAll(model,filter,callback){
  if(typeof filter==='function'){
    callback = filter;
    filter = {};
  }
  model.countDocuments(filter,function(err,count){
    callback(err,count);
  })
}




module.exports = {
  Schema:db.schema,
  mongoose:db.mongoose,
  add:add,
  del:del,
  modify:modify,
  find:find,
  countAll:countAll
}



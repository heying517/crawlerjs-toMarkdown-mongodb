var Note = require('./mangoose_type');
var schemas = require('mongodb');
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var config = require('../config/config');
var db = mongoose.connect(`mongodb://${config.crawlerThisWeb.database.user}:${config.crawlerThisWeb.database.password}@${config.mongodbServer.host}:${config.mongodbServer.port}/${config.crawlerThisWeb.database.dbs}`);


db.connection.on('open', function() {
  console.log('连接成功');
});

db.connection.on('error', function(err) {
  console.log('连接错误', err);
});

db.connection.on('disconnected', function() {
  console.log('断开连接');
});
/**
 * 插入
 * @param data 绑定具体数据对Model实例化
 */
function insert(data) {
  return new Note(data).save(function(err, docs) {
    return docs;
  });
}
/**
 * 删除
 * @param data 删除的某条记录
 */
function del(data) {
  Note.remove(data, function(err, res) {
    if (err) {
      console.log("Error:" + err);
    } else {
      console.log("Res:" + res);
    }
  })
}

/**
 * 更新
 * @param conditions 条件查询
 * @param doc 需要修改的数据
 */
function update(conditions, doc) {
  Note.update(conditions, doc, function(err, res) {
    if (err) {
      console.log("Error:" + err);
    } else {
      console.log("Res:" + res);
    }
  })
}
/**
 * 查询
 * @param conditions 条件查询
 * @returns {}
 */
let getByConditions = function(conditions) {
  return Note.find(conditions, function(err, docs) {
    if (err) console.log(err);
    return docs;
  })
}

module.exports = {
  getByConditions: getByConditions,
  insert: insert
};
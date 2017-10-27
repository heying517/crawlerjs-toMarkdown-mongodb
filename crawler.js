/**
 * 
 * @authors heying
 * @date    2017-10-20 16:38:10
 * @version 1.0.0
 */

var Crawler = require("crawler");
var toMarkdown = require('to-markdown');
var mongoData = require("./mongodb/mangoose_set");
var createMD = require("./create_md");
var config = require("./config/config");

var thisWeb = config.crawlerThisWeb;

function getContent(elm, $, regExp) {
  if (elm) {
    var content = $(elm).html();
    return result = regExp ? toMarkdown(content).replace(regExp, "") : toMarkdown(content);
  } else {
    return false;
  }
}

function formatTime(time) {
  if(!time) return new Date();
  return time.replace(/\./g, '-').replace(/\s[\x00-\xff]*/g, '');
}

var c = new Crawler();

c.queue([{
  uri: thisWeb.url + thisWeb.uri,
  jQuery: true,
  maxConnections: 10,

  callback: function(error, res, done) {
    if (error) {
      console.log(error);
    } else {
      var $ = res.$;
      var list = $(thisWeb.getElementBy.noteList);
      for (var i = 0; i < list.length; i++) {
        var uri = $(list[i]).find(thisWeb.getElementBy.noteListUri).attr('href');
        if(uri.indexOf('http') == -1) {
          uri = thisWeb.url + uri
        }
        if (uri) {
          c.queue([{
            uri: uri,
            jQuery: true,
            maxConnections: 10,

            callback: function(error, res, done) {
              if (error) {
                console.log(error);
              } else {
                var $ = res.$;
                var url = res.options.uri;
                var crawlerDetails = thisWeb.getElementBy.crawlerDetails;
                var title = { title: getContent(crawlerDetails.title, $) };
                  date = { date: formatTime(getContent(crawlerDetails.date, $), /\*/g) },
                  author = { author: getContent(crawlerDetails.author, $) },
                  noteContent = { noteContent: getContent(crawlerDetails.noteContent, $, /(<([^>]+)>)/g) },
                noteId = { noteId: url.substring(url.lastIndexOf('/') + 1) };
                var noteList = Object.assign(noteId, title, date, author, noteContent);
                //插入数据库
                mongoData.getByConditions(title).then((docs) => {
                  if (docs.length) {
                    console.log('已存在文章：', docs[0].title);
                    return false;
                  } else {
                    mongoData.insert(noteList).then((doc) => {
                      console.log('文章《' + doc.title + '》插入成功');
                      createMD(doc.noteId, doc);
                    }, (error) => {
                      console.log(error);
                    })
                  }
                }, (error) => {
                  console.log(error);
                });
              }
              done();
            }
          }]);
        }
      }
    }
    done();
  }
}]);
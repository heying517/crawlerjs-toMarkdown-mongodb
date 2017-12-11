# crawlerjs-toMarkdown-mongodb

## Node.js实现的简易爬虫 ##

**为什么要写这个爬虫呢？**

因为前两天时间朋友推荐一个静态网站生成器[Hexo](https://hexo.io/)，我一看可以快速搭建一个博客还挺方便的，但懒惰的我又不想自己写，于是我就想能不能写个爬虫去爬人家网站，刚好是md格式文件放在post文件夹里面就完了**为什么选择利用node来写爬虫呢？**
就是因为[crawler](https://github.com/bda-research/node-crawler)这个库，全兼容jQuery语法，熟悉的话用起来完全是傻瓜式上手，再用[to-markdown](https://github.com/domchristie/to-markdown)换成需要的markdown格式，存入mongodb，这过程简直不要太爽歪歪。

## 实现过程

首先选择一个要爬取的网站，为了便于处理，选择用markdown格式上传的网站，这里选择了我比较熟悉的简书、csnd、segmentfault，下面以简书30天热门为例。

### 一、分析页面

![文章列表](http://note.youdao.com/yws/public/resource/e68b3209868e4fe0704590f4f9bdd008/xmlnote/WEBRESOURCE422467f8dd23d91255b76ca8b3a61dab/591)

用开发者工具查看此网页结构，分析出每一条文章的链接地址。

随后进入详情分析具体结构

![文章详情页](http://note.youdao.com/yws/public/resource/e68b3209868e4fe0704590f4f9bdd008/xmlnote/WEBRESOURCEd543bd23a32ef6fdfa3f0f619b779973/599)

从上面的标记可以分析出标题、时间、内容、作者的DOM结构

### 二、引入依赖

爬取网站代码部分：

```javascript
var Crawler = require("crawler");
var toMarkdown = require('to-markdown');
```

mongodb部分：

```javascript
var schemas = require('mongodb');
var mongoose = require('mongoose');
```

### 三、具体实现

根据分析的网页结构套用Crawler，toMarkdown这两个库即可实现，请先阅读这两个库的使用规则，如何使用我不介绍。以下为核心代码：

```javascript
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
```


为了便于爬取多个网站，可以在config.js里面配置好各个网站的结构信息，最后只需修改配置文件的 crawlerThisWeb 参数即可。配置文件实现代码：
```javascript
const config = {
  mongodbServer: {
    host: "127.0.0.1",
    port: "27017",
  },
  jianshuConf: {
    database: {
      user: 'heying',
      password: 'heying123456',
      dbs: 'jianshu_note'
    },
    url: 'http://www.jianshu.com',
    uri: '/trending/monthly?utm_medium=index-banner-s&utm_source=desktop', //简书30日热门
    getElementBy: {
      noteList: 'ul.note-list > li',
      noteListUri: '.wrap-img',
      crawlerDetails: {
        title: '.article .title',
        date: '.publish-time',
        author: '.author span.name > a',
        noteContent: '.show-content'
      }
    }
  },
  csdnConf: {
    database: {
      user: 'csdn_note_heying',
      password: 'csdn_note_heying123456',
      dbs: 'csdn_note'
    },
    url: 'http://blog.csdn.net',
    uri: '/column/details/17076.html',
    getElementBy: {
      noteList: 'ul.detail_list > li',
      noteListUri: 'h4 a',
      crawlerDetails: {
        title: '.link_title a',
        date: '.article_manage .link_postdate',
        author: '#blog_userface .user_name',
        noteContent: '.markdown_views'
      }
    }
  },
  segmentfaultConf: {
    database: {
      user: 'segmentfault_note_heying',
      password: 'segmentfault_note_heying123456',
      dbs: 'segmentfault_note'
    },
    url: 'https://segmentfault.com',
    uri: '/blogs',
    getElementBy: {
      noteList: '.stream-list > .stream-list__item',
      noteListUri: '.summary h2.title a',
      crawlerDetails: {
        title: '#articleTitle a',
        author: '.article__author strong',
        noteContent: '.article__content'
      }
    }
  }
};

module.exports = {
  mongodbServer: config.mongodbServer,
  crawlerThisWeb: config.segmentfaultConf
};
```
大概思路就是这个样子，具体实现请看源码。如果不想以列表的方式进行爬取， 只是想爬取单个文章，请修改crawler.js即可，写法更简单，这里我也就不想说怎么改了（不会的话可以和爬虫告别了）
除了使用crawler还可以使用[cheerio](https://github.com/cheeriojs/cheerio)。cheerio思路也很简单，爬取网页，引入该网站使用到的css链接。不过本人更青睐功能更强大crawler，因为cheerio还要自己写http请求，麻烦~~

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
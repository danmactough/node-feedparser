/*!
 * node-feedparser
 * Copyright(c) 2013 Dan MacTough <danmactough@gmail.com>
 * MIT Licensed
 */

var FeedParser = require(__dirname+'/..')
  , fs = require('fs')
  , feed = __dirname+'/../test/feeds/rss2sample.xml';

fs.createReadStream(feed)
  .on('error', function (error) {
    console.error(error);
  })
  .pipe(new FeedParser())
  .on('error', function (error) {
    console.error(error);
  })
  .on('meta', function (meta) {
    console.log('===== %s =====', meta.title);
  })
  .on('readable', function() {
    var stream = this, item;
    while (item = stream.read()) {
      console.log('Got article: %s', item.title || item.description);
    }
  });
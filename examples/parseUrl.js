/*!
 * node-feedparser
 * Copyright(c) 2012 Dan MacTough <danmactough@gmail.com>
 * MIT Licensed
 */

var feedparser = require(__dirname+'/..');

var req = {
  uri: 'http://cyber.law.harvard.edu/rss/examples/rss2sample.xml',
  headers: {
    'If-Modified-Since': 'Fri, 06 Apr 2007 15:11:55 GMT',
    'If-None-Match': '"d46a5b-9e0-42d731ba304c0"'
  }
};

feedparser.parseUrl(req)
  .on('response', function (response) {
    console.log(response.statusCode);
  });

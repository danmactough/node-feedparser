/*!
 * node-feedparser
 * Copyright(c) 2011 Dan MacTough <danmactough@gmail.com>
 * MIT Licensed
 */

var FeedParser = require('../lib/feedparser')
  , parser

parser = new FeedParser();

parser.on('article', function(article){
    console.log('Got article: %s', JSON.stringify(article));
});

parser.parseFile('http://cyber.law.harvard.edu/rss/examples/rss2sample.xml');

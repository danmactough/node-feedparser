/*!
 * node-feedparser
 * Copyright(c) 2011 Dan MacTough <danmactough@gmail.com>
 * MIT Licensed
 */

var FeedParser = require('./feedparser')
  , parser

parser = new FeedParser();

parser.on('article', function(article){
    console.log('Got article: %s', JSON.stringify(article));
});

parser.parseFile('./feed');

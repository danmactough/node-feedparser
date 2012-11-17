/*!
 * node-feedparser
 * Copyright(c) 2011 Dan MacTough <danmactough@gmail.com>
 * MIT Licensed
 */

var feedparser = require(__dirname+'/..'),
    parser = feedparser.parseUrl('http://cyber.law.harvard.edu/rss/examples/rss2sample.xml');

parser.on('article', function(article){
    console.log('Got article: %s', JSON.stringify(article));
});
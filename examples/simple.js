/*!
 * node-feedparser
 * Copyright(c) 2011 Dan MacTough <danmactough@gmail.com>
 * MIT Licensed
 */

var feedparser = require(__dirname+'/..');

feedparser.parseUrl('http://cyber.law.harvard.edu/rss/examples/rss2sample.xml')

.on('article', function(article){
    console.log('Got article: %s', JSON.stringify(article));
});
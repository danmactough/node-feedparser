#!/usr/bin/env node
/*
 * Parse a feed and dump the result to the console
 *
 * Usage: curl <feed url> | bin/feedparser.js
 *        cat <feed file> | bin/feedparser.js
 *
 */
var isatty = require('tty').isatty
  , util = require('util')
  , FeedParser = require('../');

var usingConsole = isatty(1) && isatty(2);

process.stdin.pipe(new FeedParser())
  .on('error', console.error)
  .on('readable', function() {
    var stream = this, item;
    while (item = stream.read()) {
      if (usingConsole) {
        console.log(util.inspect(item, null, 10, true));
      }
      else {
        console.log(JSON.stringify(item));
      }
    }
  });

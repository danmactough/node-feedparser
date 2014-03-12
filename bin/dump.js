#!/usr/bin/env node
/*
 * Parse a feed and dump the result to the console
 *
 * Usage: curl <feed url> | bin/dump.js
 *        cat <feed file> | bin/dump.js
 *
 */
var isatty = require('tty').isatty
  , util = require('util')
  , FeedParser = require('../');

process.stdin.pipe(new FeedParser())
  .on('error', console.error)
  .on('readable', function() {
    var stream = this, item;
    while (item = stream.read()) {
      console.log(util.inspect(item, null, 10, isatty(1) && isatty(2)));
    }
  });

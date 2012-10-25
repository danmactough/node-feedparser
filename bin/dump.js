#!/usr/bin/env node
/*
 * Parse a feed and dump the result to the console
 *
 * Usage: node dump.js <feed url or filename>
 *
 */
var util = require('util')
  , feedparser = require('../')
  , file = process.argv[2];

if (!file) {
  process.exit(2);
}
feedparser.parseFile(file)
  .on('error', console.error)
  .on('complete', function(){
    console.log(util.inspect(arguments, null, 10));
  });

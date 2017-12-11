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

var argv = require('mri')(process.argv.slice(2), {
  alias: {
    u: 'feedurl',
    g: 'group',
    j: 'json'
  },
  boolean: [
    'normalize',
    'addmeta',
    'resume_sax_error',
    'json'
  ],
  default: {
    normalize: true,
    addmeta: true,
    resume_saxerror: true,
    json: !usingConsole
  }
});

var items = [];

process.stdin.pipe(new FeedParser(argv))
  .on('error', console.error)
  .on('readable', function() {
    var stream = this, item;
    while (item = stream.read()) {
      if (argv.group) {
        items.push(item);
      }
      else {
        if (argv.json) {
          console.log(JSON.stringify(item));
        }
        else {
          console.log(util.inspect(item, null, 10, true));
        }
      }
    }
  })
  .on('end', function () {
    if (argv.group) {
      if (argv.json) {
        console.log(JSON.stringify(items));
      }
      else {
        console.log(util.inspect(items, null, 10, true));
      }
    }
  });

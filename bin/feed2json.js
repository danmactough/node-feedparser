#!/usr/bin/env node
/*
 * Parse a feed and dump the result to the console
 *
 */
var commander = require('commander')
  , FeedParser = require('../');

// Monkey-patch commander...
var helpInformation = commander.Command.prototype.helpInformation;
commander.Command.prototype.helpInformation = function () {
  var input = '<input> | '
  return helpInformation.call(this).replace('Usage: ', 'Usage: ' + input);
};
var program = new commander.Command('feed2json');

program
  .version(require('../package.json').version)
  .usage('[options]')
  .option('--no-normalized', 'disable normalized properties')
  .option('--no-addmeta', 'disable adding the feed\'s meta information to each article')
  .option('--feedurl <url>', 'url of the feed')
  .parse(process.argv);

if (process.stdin.isTTY) {
  program.hgelp();
}

var options = {
  normalize: program.normalized,
  addmeta: program.addmeta,
  feedurl: program.feedurl
};

var feedparser = new FeedParser(options)
  , errored = false;

feedparser.on('error', function (err) {
  errored = true;
  console.error(err);
});
feedparser.on('readable', function() {
  var stream = this, item;
  while (item = stream.read()) {
    console.log(JSON.stringify(item));
  }
});
feedparser.on('end', function () {
  process.exit(errored ? 1 : 0);
});

process.stdout.on('error', function (err) {
  // Enable piping to head/tail etc.
  if (err.code === 'EPIPE') {
    process.exit();
  }
});
process.stdin.pipe(feedparser);

/* eslint-disable */
var heapdump = require('heapdump');
var FeedParser = require('..');
var fs = require('fs');
var feed = __dirname + '/feeds/intertwingly.atom';

var ct = 10000;
global.gc();
var premem = process.memoryUsage().heapUsed;
if (process.env.HEAPDUMP) heapdump.writeSnapshot();
console.log("Pre: %s", premem);

function finishedRun () {
  global.gc();
  var postmem = process.memoryUsage().heapUsed;
  var num = 10000 - ct + 1;
  if (num % 100 === 0) {
    if (process.env.HEAPDUMP) heapdump.writeSnapshot();
    console.log("Run %s: %s", num, postmem);
  }

  if (--ct > 0) {
    run(finishedRun);
  }
  else {
    process.exit();
  }
}

function run (cb) {
  var feedparser = new FeedParser();

  var input = fs.createReadStream(feed, {autoClose: true});
  var output = fs.createWriteStream('/dev/null');

  output.once('finish', cb);

  // function notice (src, ev) {
  //   console.log(`Got ${src}:${ev}`);
  // }

  input.pipe(feedparser);
  function onReadable () {
    var chunk;
    while ((chunk = this.read()) !== null) {
      output.write(JSON.stringify(chunk));
    }
  }
  feedparser.on("readable", onReadable);
  // input.on("close", notice.bind(null, "input", "close"));
  // feedparser.on("close", notice.bind(null, "feedparser", "close"));
  // feedparser.on("end", notice.bind(null, "feedparser", "end"));
  // feedparser.on("finish", notice.bind(null, "feedparser", "finish"));
  // output.on("close", notice.bind(null, "output", "close"));
  // output.on("end", notice.bind(null, "output", "end"));
  // output.on("finish", notice.bind(null, "output", "finish"));
  feedparser.once("end", function () {
    feedparser.removeListener("readable", onReadable);
    output.end();
  });
}

run(finishedRun);

var PassThrough = require('stream').PassThrough;
// We're using this form so we can run tests on older Node versions that don't have stream.promises.pipeline
var pipeline = require('util').promisify(require('stream').pipeline);

describe('async iterator usage', function () {
  // These tests use .pipe() only to allow testing in older Node versions.
  // In modern Node versions, you can use pipeline() with async iterators 
  // instead of .pipe(). If you use .pipe, you must add your own error handling
  // to avoid uncaught exceptions on errors.
  it('should work as an async iterator', async function () {
    var feedparser = new FeedParser();
    var feed = __dirname + '/feeds/rss2sample.xml';
    var items = [];

    fs.createReadStream(feed).pipe(feedparser);

    for await (var item of feedparser) {
      items.push(item);
    }

    assert.equal(items.length, 4);
  });

  it('should surface errors via try/catch', async function () {
    var feedparser = new FeedParser();
    var feed = __dirname + '/feeds/notafeed.html';
    fs.createReadStream(feed).pipe(feedparser);

    var caught = null;
    try {
      for await (var item of feedparser) {} // eslint-disable-line no-empty, no-unused-vars
    } catch (err) {
      caught = err;
    }

    assert.ok(caught instanceof Error);
    assert.equal(caught.message, 'Not a feed');
  });

  it('should catch errors after a delayed iteration start', async function () {
    if (process.release.lts < 'Gallium') {
      this.skip(); // Older Node versions don't allow async iterators with pipeline, so we can't test this behavior.
    }
    var feedparser = new FeedParser();
    var source = new PassThrough();
    var items = [];
    var caught = null;
    var uncaught = null;
    function onUncaught(err) {
      uncaught = err;
    }
    process.prependOnceListener('uncaughtException', onUncaught);

    source.end('not a feed');

    await new Promise(setImmediate);

    try {
      await pipeline(source, feedparser, async function (fpIterable) {
        for await (var item of fpIterable) {
          items.push(item.title);
        }
      });
    } catch (err) {
      caught = err;
    } finally {
      process.removeListener('uncaughtException', onUncaught);
      assert.equal(uncaught, null);
      assert.ok(caught instanceof Error);
      assert.equal(caught.message, 'Not a feed');
      assert.equal(items.length, 0);
    }
  });

  describe('resume_saxerror behavior', function () {
    var feed = __dirname + '/feeds/saxerror.xml';

    it('should continue iterating past SAX errors by default (resume_saxerror: true)', async function () {
      var feedparser = new FeedParser({ strict: true });
      fs.createReadStream(feed).pipe(feedparser);
      var items = [];

      for await (var item of feedparser) {
        items.push(item.title);
      }

      assert.equal(items.length, 3);
      assert.deepEqual(items, ['Good Item', 'Bad Item', 'Item After Error']);
    });

    it('should throw on SAX errors when (resume_saxerror: false)', async function () {
      var feedparser = new FeedParser({ strict: true, resume_saxerror: false });
      fs.createReadStream(feed).pipe(feedparser);
      var items = [];

      var caught = null;
      try {
        for await (var item of feedparser) {
          items.push(item.title);
        }
      } catch (err) {
        caught = err;
      }

      assert.ok(caught instanceof Error);
      assert.equal(items.length, 0);
    });
  });
});

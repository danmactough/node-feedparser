var FeedParser = require('..');

describe('async iterator usage', function () {
  it('should work as an async iterator', async function () {
    var feedparser = new FeedParser();
    var feed = __dirname + '/feeds/rss2sample.xml';
    var items = [];

    fs.createReadStream(feed).pipe(feedparser);

    for await (const item of feedparser) {
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
      for await (const item of feedparser) {} // eslint-disable-line no-empty, no-unused-vars
    } catch (err) {
      caught = err;
    }

    assert.ok(caught instanceof Error);
    assert.equal(caught.message, 'Not a feed');
  });

  describe('resume_saxerror behavior', function () {
    var feed = __dirname + '/feeds/saxerror.xml';

    it('should continue iterating past SAX errors by default (resume_saxerror: true)', async function () {
      var feedparser = new FeedParser({ strict: true });
      fs.createReadStream(feed).pipe(feedparser);
      var items = [];

      for await (const item of feedparser) {
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
        for await (const item of feedparser) {
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

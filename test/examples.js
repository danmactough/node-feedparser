var FeedParser = require('../');

describe('examples', function () {
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

  it('should surface errors via try/catch when using async iterator', async function () {
    var feedparser = new FeedParser();
    var feed = __dirname + '/feeds/notafeed.html';
    fs.createReadStream(feed).pipe(feedparser);

    var caught = null;
    try {
      for await (const item of feedparser) {} // eslint-disable-line no-unused-vars
    } catch (err) {
      caught = err;
    }

    assert.ok(caught instanceof Error);
    assert.equal(caught.message, 'Not a feed');
  });
});

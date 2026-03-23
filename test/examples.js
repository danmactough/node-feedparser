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
});

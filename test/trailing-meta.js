describe('trailing metadata', function () {

  var feed = __dirname + '/feeds/rss-with-trailing-meta.xml';

  it('should include channel metadata that appears after items in final meta', function (done) {
    var feedparser = new FeedParser();
    var items = [];
    var meta;
    var metaEvents = 0;

    fs.createReadStream(feed).pipe(feedparser)
      .on('error', function (err) {
        assert.ifError(err);
        done(err);
      })
      .on('meta', function (_meta) {
        meta = _meta;
        metaEvents++;
      })
      .on('readable', function () {
        var item;
        while ((item = this.read()) !== null) {
          items.push(item);
        }
      })
      .on('end', function () {
        assert.strictEqual(metaEvents, 1);
        assert.deepStrictEqual(feedparser.meta.categories, ['Music']);
        assert.strictEqual(meta, feedparser.meta);
        assert.strictEqual(items.length, 1);
        assert.strictEqual(items[0].meta, feedparser.meta);
        assert.deepStrictEqual(items[0].meta.categories, ['Music']);
        assert.strictEqual(feedparser.meta['rss:item'], undefined);
        done();
      });
  });

  it('should skip items in final native meta when normalize is false', function (done) {
    var feedparser = new FeedParser({ normalize: false });

    fs.createReadStream(feed).pipe(feedparser)
      .on('error', function (err) {
        assert.ifError(err);
        done(err);
      })
      .on('readable', function () {
        var item;
        while ((item = this.read()) !== null) {
          assert(item);
        }
      })
      .on('end', function () {
        assert.strictEqual(feedparser.meta.title, undefined);
        assert.strictEqual(feedparser.meta['rss:title']['#'], 'Trailing Meta Feed');
        assert.strictEqual(feedparser.meta['itunes:category']['@'].text, 'Music');
        assert.strictEqual(feedparser.meta['rss:item'], undefined);
        assert.strictEqual(feedparser.meta.item, undefined);
        done();
      });
  });

});

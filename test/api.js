describe('api', function () {

  var feed = __dirname + '/feeds/rss2sample.xml';

  it('should read a stream via .pipe()', function (done) {
    var meta
      , items = [];

    fs.createReadStream(feed).pipe(FeedParser())
      .on('error', function (err) {
        assert.ifError(err);
        done(err);
      })
      .on('meta', function (_meta) {
        meta = _meta;
      })
      .on('readable', function () {
        var item;
        while (item = this.read()) {
          items.push(item);
        }
        assert.ok(items.length);
      })
      .on('end', function () {
        assert(meta);
        assert.strictEqual(items.length, 4);
        done();
      });
  });

  it('should parse and set options', function (done) {
    var meta
      , item
      , options = { normalize: false, addmeta: false };

    fs.createReadStream(feed).pipe(FeedParser(options))
      .on('error', function (err) {
        assert.ifError(err);
        done(err);
      })
      .on('meta', function (_meta) {
        meta = _meta;
      })
      .on('readable', function () {
        var _item = this.read();
        item || (item = _item);
      })
      .on('end', function () {
        assert(meta);
        assert.equal(meta.title, null);
        assert.equal(meta['rss:title']['#'], 'Liftoff News');
        assert.equal(item.meta, null);
        done();
      });
  });

});
describe('api', function () {

  var feed = __dirname + '/feeds/rss2sample.xml';

  it('should read a stream via .pipe()', function (done) {
    var events = [];

    fs.createReadStream(feed).pipe(FeedParser())
      .on('error', function (err) {
        assert.ifError(err);
        events.push('error');
      })
      .on('meta', function (meta) {
        assert.notEqual(meta, null);
        events.push('meta');
      })
      .on('readable', function () {
        var stream = this, items = [], item;
        while (item = stream.read()) {
          items.push(item);
        }
        assert.ok(items.length);
        events.push('article');
      })
      .on('end', function () {
        assert.equal(events.indexOf('error'), -1);
        assert.ok(~events.indexOf('meta'));
        assert.ok(~events.indexOf('article'));
        done();
      });
  });

  it('should parse and set options', function (done) {
    var options = { normalize: false, addmeta: false };

    fs.createReadStream(feed).pipe(FeedParser(options))
      .on('error', function (err) {
        assert.ifError(err);
        done(err);
      })
      .on('meta', function (meta) {
        assert.notEqual(meta, null);
        assert.equal(meta.title, null);
        assert.equal(meta['rss:title']['#'], 'Liftoff News');
      })
      .once('readable', function () {
        var stream = this;
        var item = stream.read();
        assert.equal(item.meta, null);
        done();
      });
  });

});
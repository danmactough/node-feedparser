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

  it('should normalize valid RSS dates as Date objects', function (done) {
    var parser = new FeedParser();
    parser.once('readable', function () {
      var item = this.read();
      assert(item.pubdate instanceof Date);
      assert(item.date instanceof Date);
      done();
    });
    parser.on('error', function (err) {
      assert.ifError(err);
      done(err);
    });
    parser.end('<?xml version="1.0"?><rss version="2.0"><channel>' +
      '<title>RSS</title><item><title>Valid date</title>' +
      '<pubDate>Mon, 01 Jan 2024 12:00:00 +0000</pubDate>' +
      '</item></channel></rss>');
  });

  it('should ignore invalid normalized RSS and Atom dates', function (done) {
    var feeds = [
      '<?xml version="1.0"?><rss version="2.0"><channel>' +
        '<title>RSS</title><item><title>Invalid RSS date</title>' +
        '<pubDate>not-a-date</pubDate></item></channel></rss>',
      '<?xml version="1.0"?><feed xmlns="http://www.w3.org/2005/Atom">' +
        '<title>Atom</title><entry><title>Invalid Atom date</title>' +
        '<updated>not-a-date</updated></entry></feed>',
      '<?xml version="1.0"?><rss version="2.0"><channel>' +
        '<title>RSS</title><item><title>Empty RSS date</title>' +
        '<pubDate></pubDate></item></channel></rss>'
    ];
    var index = 0;

    function parseNext () {
      var meta
        , parser = new FeedParser();
      parser.once('meta', function (_meta) {
        meta = _meta;
      });
      parser.once('readable', function () {
        var item = this.read();
        assert.strictEqual(meta.pubdate, null);
        assert.strictEqual(meta.date, null);
        assert.strictEqual(item.pubdate, null);
        assert.strictEqual(item.date, null);
        index++;
        if (index < feeds.length) {
          parseNext();
        } else {
          done();
        }
      });
      parser.on('error', function (err) {
        assert.ifError(err);
        done(err);
      });
      parser.end(feeds[index]);
    }

    parseNext();
  });

});

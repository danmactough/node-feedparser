describe('bad feeds', function(){

  describe('not a feed', function () {

    var feed = __dirname + '/feeds/notafeed.html';

    it('should emit an error and no data', function (done) {
      var error;
      var feedparser = new FeedParser();
      fs.createReadStream(feed).pipe(feedparser);
      feedparser.once('readable', function () {
        assert.strictEqual(this.read(), null);
      })
      .on('error', function (err) {
        error = err;
      })
      .on('end', function () {
        assert.ok(error instanceof Error);
        assert.equal(error.message, 'Not a feed');
        done();
      });
    });

  });

  describe('duplicate guids', function () {

    var feed = __dirname + '/feeds/guid-dupes.xml';

    it('should just use the first', function (done) {
      var feedparser = new FeedParser();
      fs.createReadStream(feed).pipe(feedparser);
      feedparser.once('readable', function () {
        var stream = this;
        var item = stream.read();
        assert.equal(item.guid, 'http://www.braingle.com/50366.html');
        assert.equal(item.permalink, 'http://www.braingle.com/50366.html');
        done();
      })
      .on('error', function (err) {
        assert.ifError(err);
        done(err);
      });
    });

  });

  describe('gzipped feed', function () {

    var feed = __dirname + '/feeds/invalid-characters-gzipped.xml';

    it('should gracefully emit an error and not throw', function (done) {
      var error;
      var feedparser = new FeedParser();
      fs.createReadStream(feed).pipe(feedparser);
      feedparser.once('readable', function () {
        assert.strictEqual(this.read(), null);
      })
      .on('error', function (err) {
        error = err;
      })
      .on('end', function () {
        assert.ok(error instanceof Error);
        assert.equal(error.message, 'Not a feed');
        done();
      });
    });

  });

  describe('SAXError handling', function () {

    // The fixture is a valid RSS feed with an unescaped & in one item's link.
    // strict: true is required because feedparser defaults to non-strict SAX mode.
    var feed = __dirname + '/feeds/saxerror.xml';

    describe('resume_saxerror: true (default)', function () {

      it('should silently collect the error and continue parsing all items', function (done) {
        var items = [];
        var feedparser = new FeedParser({ strict: true });
        fs.createReadStream(feed).pipe(feedparser);
        feedparser.on('readable', function () {
          var item;
          while ((item = this.read())) items.push(item.title);
        })
        .on('error', function (err) {
          done(err);
        })
        .on('end', function () {
          assert.equal(feedparser.errors.length, 1);
          assert.ok(feedparser.errors[0] instanceof Error);
          assert.equal(items.length, 3);
          assert.deepEqual(items, ['Good Item', 'Bad Item', 'Item After Error']);
          done();
        });
      });

    });

    describe('resume_saxerror: false', function () {

      it('should emit the SAXError and abort parsing', function (done) {
        var items = [];
        var feedparser = new FeedParser({ strict: true, resume_saxerror: false });
        fs.createReadStream(feed).pipe(feedparser);
        feedparser.on('readable', function () {
          var item;
          while ((item = this.read())) items.push(item.title);
        })
        .on('error', function (err) {
          assert.ok(err instanceof Error);
          assert.equal(feedparser.errors.length, 1);
          assert.strictEqual(feedparser.errors[0], err);
          // Only the item before the error should have been parsed
          assert.deepEqual(items, ['Good Item']);
          done();
        });
      });

    });

  });
});

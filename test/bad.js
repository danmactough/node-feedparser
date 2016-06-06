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
        assert.ok(error.message.match(/^Invalid code point/));
        done();
      });
    });

  });
});

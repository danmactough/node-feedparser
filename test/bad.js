describe('bad feeds', function(){

  describe('not a feed', function () {

    var feed = __dirname + '/feeds/notafeed.html';

    it('should emit an error and no data', function (done) {
      var error;
      fs.createReadStream(feed).pipe(new FeedParser())
        .once('readable', function () {
          done(new Error('Shouldn\'t happen'));
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
      fs.createReadStream(feed).pipe(new FeedParser())
        .once('readable', function () {
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
});

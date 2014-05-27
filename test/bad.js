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
});

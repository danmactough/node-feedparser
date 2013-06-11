describe('bad feeds', function(){

  describe('not a feed', function () {

    var feed = __dirname + '/feeds/notafeed.html';

    it('should emit an error and no data', function (done) {
      fs.createReadStream(feed).pipe(new FeedParser())
        .once('readable', function () {
          done(new Error('Shouldn\'t happen'));
        })
        .on('error', function (err) {
          assert.ok(err instanceof Error);
          assert.equal(err.message, 'Not a feed');
          done();
        });
    });

  });
});

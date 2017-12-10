describe('strip html', function () {

  var feed = __dirname + '/feeds/title-with-angle-brackets.xml';

  it('should aggressively strip html', function (done) {
    fs.createReadStream(feed).pipe(new FeedParser())
      .once('readable', function () {
        var stream = this;
        assert.equal(stream.read().title, 'RSS ');
        done();
      })
      .on('error', function (err) {
        assert.ifError(err);
        done(err);
      });
  });

});

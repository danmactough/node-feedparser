describe('strip html', function () {

  var feed = __dirname + '/feeds/title-with-angle-brackets.xml';

  it('should NOT aggressively strip html by default', function (done) {
    fs.createReadStream(feed).pipe(new FeedParser())
      .once('readable', function () {
        var stream = this;
        assert.equal(stream.read().title, 'RSS <<< Title >>>');
        done();
      })
      .on('error', function (err) {
        assert.ifError(err);
        done(err);
      });
  });

  it('should aggressively strip html with option `strip_html`', function (done) {
    fs.createReadStream(feed).pipe(new FeedParser({ strip_html: true }))
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

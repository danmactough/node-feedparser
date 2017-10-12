describe('links', function(){

  var feed = __dirname + '/feeds/non-text-alternate-links.xml';

  it('should extract alternate links from feed', function (done) {
    fs.createReadStream(feed).pipe(new FeedParser())
      .once('readable', function () {
        var stream = this;
        assert.equal(stream.read().link, 'https://ncatlab.org/nlab/show/%280%2C1%29-category');
        done();
      })
      .on('error', function (err) {
        assert.ifError(err);
        done(err);
      });
  });

});

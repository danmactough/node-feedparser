describe('categories', function(){

  var feed = __dirname + '/feeds/category-feed.xml';

  it('should not seperate by comma', function (done) {
    fs.createReadStream(feed).pipe(new FeedParser())
      .once('readable', function () {
        var stream = this;
        assert.deepEqual(stream.read().categories, [
          'Water Pollution',
          'Gowanus Canal (Brooklyn, NY)'
        ]);
        done();
      })
      .on('error', function (err) {
        assert.ifError(err);
        done(err);
      });
  });

});

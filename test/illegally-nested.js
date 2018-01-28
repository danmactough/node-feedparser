describe('illegally nested', function(){

  var feed = __dirname + '/feeds/illegally-nested.xml';

  it('should ignore illegally-nested items', function (done){
    var itemCount = 0;
    fs.createReadStream(feed).pipe(new FeedParser())
      .on('readable', function () {
        var stream = this;
        while (stream.read()) {
          itemCount++;
        }
      })
      .on('finish', function () {
        assert.strictEqual(itemCount, 10);
        done();
      })
      .on('error', function (err) {
        assert.ifError(err);
        done(err);
      });
  });

});


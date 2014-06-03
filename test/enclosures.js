describe('enclosures', function(){



  it('should not have duplicate enclosures from different elements', function (done){
    var feed = __dirname + '/feeds/mediacontent-dupes.xml';
    fs.createReadStream(feed).pipe(new FeedParser())
      .once('readable', function () {
        var stream = this;
        assert.equal(stream.read().enclosures.length, 1);
        done();
      })
      .on('error', function (err) {
        assert.ifError(err);
        done(err);
      });
  });

  it('should have all enclosures', function (done){
    var feed = __dirname + '/feeds/different-enclosure-type.js';
    fs.createReadStream(feed).pipe(new FeedParser())
      .once('readable', function () {
        var stream = this;
        var data = stream.read();
        assert.equal(data.enclosures.length, 2);
        done();
      })
      .on('error', function (err) {
        assert.ifError(err);
        done(err);
      });
  });
});
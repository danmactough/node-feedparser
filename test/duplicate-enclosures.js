describe('duplicate enclosures', function(){

  var feed = __dirname + '/feeds/mediacontent-dupes.xml';

  it('should not have duplicate enclosures from different elements', function (done){
    fs.createReadStream(feed).pipe(new FeedParser())
      .once('readable', function () {
        var stream = this;
        assert.strictEqual(stream.read().enclosures.length, 2);
        done();
      })
      .on('error', function (err) {
        assert.ifError(err);
        done(err);
      });
  });

});


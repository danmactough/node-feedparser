describe('xmlbase', function(){

  var feed = __dirname + '/feeds/intertwingly.atom';

  it('should handle relative URIs with no root xml:base', function (done) {
    fs.createReadStream(feed).pipe(new FeedParser())
      .on('meta', function (meta) {
        assert.equal('http://intertwingly.net/blog/', meta.link);
        done();
      })
      .on('error', function (err) {
        assert.ifError(err);
        done(err);
      });
  });

  it('should parse feedurl option and handle relative URIs with no root xml:base', function (done) {
    var options = { feedurl: 'http://intertwingly.net/blog/index.atom' };

    fs.createReadStream(feed).pipe(new FeedParser(options))
      .on('meta', function (meta) {
        assert.equal('http://intertwingly.net/blog/', meta.link);
        done();
      })
      .on('error', function (err) {
        assert.ifError(err);
        done(err);
      });
  });

});

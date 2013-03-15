describe('feedparser', function(){

  var feed = 'http://localhost:21337/codeGoogle.atom';

  before(function (done) {
    server(done);
  });

  after(function (done) {
    server.close(done);
  });

  describe('Troublesome differences in parseString vs. parseUrl', function () {
    describe('.parseUrl', function(){
      it('should be ok', function(done) {
        var req = {
          uri: feed,
        };
        FeedParser.parseUrl(req, function (err, meta, items) {
          assert.ifError(err);
          done();
        });
      });
    });
    describe('.parseString', function(){
      var body;

      before(function (done) {
        var req = {
          uri: feed,
        };
        var request = require('request');
        request(req, function (err, resp) {
          assert.ifError(err);
          body = resp.body;
          done();
        });
      });

      it('should be ok', function(done) {
        FeedParser.parseString(body, function (err, meta, items) {
          assert.ifError(err);
          done();
        });
      });
    });
  });
});

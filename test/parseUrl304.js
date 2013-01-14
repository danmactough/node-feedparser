describe('feedparser', function(){

  before(function (done) {
    server(done);
  });

  after(function (done) {
    server.close(done);
  });

  describe('Conditional GET request to a resource that has not changed', function () {
    describe('.parseUrl', function(){
      it('should return 304 Not Modified', function(done) {
        var req = {
          uri: 'http://localhost:21337/rss2sample.xml?notModified=true',
          headers: {
            'If-Modified-Since': 'Fri, 06 Apr 2007 15:11:55 GMT',
            'If-None-Match': '"d46a5b-9e0-42d731ba304c0"'
          }
        };
        FeedParser.parseUrl(req).on('response', function (response) {
          assert.equal(response.statusCode, 304);
          done();
        });
      });
    });
  });
});

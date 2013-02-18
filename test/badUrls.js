describe('feedparser', function(){

  describe('.parseUrl should throw on bad or null urls', function () {

    describe('null url', function(){
      it('should throw', function() {
        assert.throws(function () {
          FeedParser.parseUrl(null);
        }, function (e) {
          return (e instanceof Error && /Invalid URL/.test(e.message));
        });
      });
    });

    describe('bad url', function(){
      it('should throw', function() {
        assert.throws(function () {
          FeedParser.parseUrl('ftp://foobar');
        }, function (e) {
          return (e instanceof Error && /Invalid URL/.test(e.message));
        });
      });
    });

    describe('null object.uri', function(){
      it('should throw', function() {
        assert.throws(function () {
          FeedParser.parseUrl({ uri: null });
        }, function (e) {
          return (e instanceof Error && /Invalid URL/.test(e.message));
        });
      });
    });

    describe('null object.url', function(){
      it('should throw', function() {
        assert.throws(function () {
          FeedParser.parseUrl({ url: null });
        }, function (e) {
          return (e instanceof Error && /Invalid URL/.test(e.message));
        });
      });
    });

    describe('bad object.uri string', function(){
      it('should throw', function() {
        assert.throws(function () {
          FeedParser.parseUrl({ uri: 'ftp://foobar' });
        }, function (e) {
          return (e instanceof Error && /Invalid URL/.test(e.message));
        });
      });
    });

    describe('bad object.uri object', function(){
      it('should throw', function() {
        assert.throws(function () {
          FeedParser.parseUrl({ uri: { nothref: 'http://foobar.com' } });
        }, function (e) {
          return (e instanceof Error && /Invalid URL/.test(e.message));
        });
      });
    });

    describe('bad object.url string', function(){
      it('should throw', function() {
        assert.throws(function () {
          FeedParser.parseUrl({ url: 'ftp://foobar' });
        }, function (e) {
          return (e instanceof Error && /Invalid URL/.test(e.message));
        });
      });
    });

    describe('bad object.url object', function(){
      it('should throw', function() {
        assert.throws(function () {
          FeedParser.parseUrl({ url: { nothref: 'http://foobar.com' } });
        }, function (e) {
          return (e instanceof Error && /Invalid URL/.test(e.message));
        });
      });
    });

  });
});

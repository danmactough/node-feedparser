describe('feedparser', function(){

  var feed = __dirname + '/feeds/complexNamespaceFeed.xml'
    , meta = {}
    , articles = {}
    ;

  describe('complexNamespaceFeed', function(){
    before(function(done){
      FeedParser.parseFile(feed, function (error, _meta, _articles) {
        assert.ifError(error);
        meta = _meta;
        articles = _articles;
        done();
      });
    });
    describe('articles', function(){
      it('should contain 1 article', function() {
        assert.strictEqual(articles.length, 1);
      });
      it('should have a guid equal to urn:uuid:d5ffaea2-0a9a-4f38-98fc-5c364177b6b4', function(){
        assert.equal(articles[0].guid, 'urn:uuid:d5ffaea2-0a9a-4f38-98fc-5c364177b6b4');
      });
    });
  });
});

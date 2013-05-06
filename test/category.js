describe('feedparser', function(){

  var feed = __dirname + '/feeds/category-feed.xml'
    , meta = {}
    , articles = {}
    ;

  describe('categories with comma in them', function(){
    before(function(done){
      FeedParser.parseFile(feed, function (error, _meta, _articles) {
        assert.ifError(error);
        meta = _meta;
        articles = _articles;
        done();
      });
    });
    describe('article', function(){
      it('should should not seperate by comma', function() {
        assert.deepEqual(articles[0].categories, [
          'Water Pollution',
          'Gowanus Canal (Brooklyn, NY)'
        ]);
      });
    });
  });
});

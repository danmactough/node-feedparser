describe('namespaced elements', function(){

  describe('standard namespaces', function(){

    var feed = __dirname + '/feeds/wapowellness.xml';

    it('should parse common standard namespaces', function (done) {
      fs.createReadStream(feed).pipe(new FeedParser())
        .once('readable', function () {
          var stream = this;
          var item = stream.read();
          assert.equal(item.author, 'Lenny Bernstein');
          assert.equal(item.origlink, 'http://www.washingtonpost.com/lifestyle/wellness/schools-minister-to-kids-fitness-and-nutrition-needs/2012/08/21/0ca90d46-e6eb-11e1-936a-b801f1abab19_story.html?wprss=rss_wellness');
          done();
        })
        .on('error', function (err) {
          assert.ifError(err);
          done(err);
        });
    });

  });

  describe('non-standard namespaces', function(){

    var feed = __dirname + '/feeds/complexNamespaceFeed.xml';

    it('should parse non-standard namespaces', function (done) {
      fs.createReadStream(feed).pipe(new FeedParser())
        .once('readable', function () {
          var stream = this;
          var item = stream.read();
          assert.equal(item.guid, 'urn:uuid:d5ffaea2-0a9a-4f38-98fc-5c364177b6b4');
          done();
        })
        .on('error', function (err) {
          assert.ifError(err);
          done(err);
        });
    });

  });

  describe('nondefaultnamespace-baseline', function(){

    var feed = __dirname + '/feeds/nondefaultnamespace-baseline.atom';

    it('should parse nondefaultnamespace test baseline', function (done) {
      fs.createReadStream(feed).pipe(new FeedParser())
        .once('readable', function () {
          var stream = this;
          var item = stream.read();
          assert.ok(item.title.match(/^If you can read/));
          assert.ok(item.description.match(/^<div xmlns="http:\/\/www.w3.org\/1999\/xhtml">/));
          done();
        })
        .on('error', function (err) {
          assert.ifError(err);
          done(err);
        });
    });

  });

  describe('nondefaultnamespace Test case 1', function(){

    var feed = __dirname + '/feeds/nondefaultnamespace.atom';

    it('should parse default namespace XHTML; Atom namespace mapped to a prefix', function (done) {
      fs.createReadStream(feed).pipe(new FeedParser())
        .once('readable', function () {
          var stream = this;
          var item = stream.read();
          assert.ok(item.title.match(/^If you can read/));
          assert.ok(item.description.match(/^<div>/));
          done();
        })
        .on('error', function (err) {
          assert.ifError(err);
          done(err);
        });
    });

  });

  describe('nondefaultnamespace Test case 2', function(){

    var feed = __dirname + '/feeds/nondefaultnamespace-xhtml.atom';

    it('should parse default namespace Atom; XHTML namespace mapped to a prefix', function (done) {
      fs.createReadStream(feed).pipe(new FeedParser())
        .once('readable', function () {
          var stream = this;
          var item = stream.read();
          assert.ok(item.title.match(/^If you can read/));
          assert.ok(item.description.match(/^<h:div>/));
          done();
        })
        .on('error', function (err) {
          assert.ifError(err);
          done(err);
        });
    });

  });

  describe('nondefaultnamespace Test case 3', function(){

    var feed = __dirname + '/feeds/unknown-namespace.atom';

    it('should parse default namespace Atom; XHTML namespace mapped to a prefix; FooML namespace default in the namespace DIV', function (done) {
      fs.createReadStream(feed).pipe(new FeedParser())
        .once('readable', function () {
          var stream = this;
          var item = stream.read();
          assert.equal(item.title, 'This entry contains XHTML-looking markup that is not XHTML');
          assert.ok(item.description.match(/^<h:div xmlns="http:\/\/hsivonen.iki.fi\/FooML">/));
          assert.ok(item.description.match(/<h:li>This is an XHTML list item./));
          assert.ok(item.description.match(/<li>This is not an XHTML list item./));
          done();
        })
        .on('error', function (err) {
          assert.ifError(err);
          done(err);
        });
    });

  });

});

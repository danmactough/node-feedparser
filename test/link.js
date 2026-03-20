describe('links', function(){

  var feed = __dirname + '/feeds/non-text-alternate-links.xml';

  it('should extract alternate links from feed', function (done) {
    fs.createReadStream(feed).pipe(new FeedParser())
      .once('readable', function () {
        var stream = this;
        assert.equal(stream.read().link, 'https://ncatlab.org/nlab/show/%280%2C1%29-category');
        done();
      })
      .on('error', function (err) {
        assert.ifError(err);
        done(err);
      });
  });

  it('should not throw or emit a deprecation warning for tag: URI links (issue #295)', function (done) {
    var tagUriFeed = __dirname + '/feeds/atom-with-tag-uri-links.xml';
    var items = [];
    var sawDeprecation = false;
    var origEmit = process.emit;
    process.emit = function(event, warning) {
      if (event === 'warning' && warning && warning.name === 'DeprecationWarning') {
        sawDeprecation = true;
      }
      return origEmit.apply(process, arguments);
    };
    fs.createReadStream(tagUriFeed).pipe(new FeedParser())
      .on('readable', function () {
        var stream = this, item;
        while ((item = stream.read()) !== null) {
          items.push(item);
        }
      })
      .on('end', function () {
        process.emit = origEmit;
        assert.equal(items.length, 1);
        assert.equal(items[0].link, 'tag:mefi.social,2024-01-26:objectId=20368395');
        assert.equal(sawDeprecation, false, 'Should not emit a DEP0170 deprecation warning');
        done();
      })
      .on('error', function (err) {
        process.emit = origEmit;
        assert.ifError(err);
        done(err);
      });
  });

});

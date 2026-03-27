describe('xmlbase', function(){

  it('should resolve relative URIs in meta elements with no root xml:base', function (done) {
    var feed = __dirname + '/feeds/intertwingly.atom';

    fs.createReadStream(feed).pipe(new FeedParser())
      .on('meta', function (meta) {
        assert.equal('http://intertwingly.net/blog/', meta.link);
        assert.equal('http://intertwingly.net/favicon.ico', meta.favicon);
        done();
      })
      .on('error', function (err) {
        assert.ifError(err);
        done(err);
      });
  });

  it('should resolve relative image url in channel', function (done) {
    var feed = __dirname + '/feeds/relative-channel-image-url.xml';
    fs.createReadStream(feed).pipe(new FeedParser())
      .on('meta', function (meta) {
        assert.equal('https://www.virtualbox.org/graphics/vbox_logo2_gradient.png', meta.image.url);
        done();
      })
      .on('error', function (err) {
        assert.ifError(err);
        done(err);
      });
  });

  it('should parse feedurl option and handle relative URIs with no root xml:base', function (done) {
    var feed = __dirname + '/feeds/intertwingly.atom';
    var options = { feedurl: 'http://intertwingly.net/blog/index.atom' };

    fs.createReadStream(feed).pipe(new FeedParser(options))
      .on('meta', function (meta) {
        assert.equal('http://intertwingly.net/blog/', meta.link);
        assert.equal('http://intertwingly.net/favicon.ico', meta.favicon);
        done();
      })
      .on('error', function (err) {
        assert.ifError(err);
        done(err);
      });
  });

  it('should resolve relative URI item links with no root xml:base', function (done) {
    var feed = __dirname + '/feeds/tpm.atom';
    var links = [];

    fs.createReadStream(feed).pipe(new FeedParser())
    .on('readable', function () {
      var item;
      while ((item = this.read())) {
        links.push(item.link);
      }
    })
    .on('error', function (err) {
      assert.ifError(err);
      done(err);
    })
    .on('end', function () {
      assert.equal(links[0], 'http://talkingpointsmemo.com/livewire/hannity-announces-fox-hired-sebastian-gorka-national-security-strategist');
      assert.equal(links[1], 'http://talkingpointsmemo.com/edblog/were-hiring-senior-editor');
      assert.equal(links.length, 20);
      done();
    });
  });

  it('should resolve relative URI item links with an empty xml:base', function (done) {
    var feed = __dirname + '/feeds/tpm-with-empty-base.atom';
    var links = [];

    fs.createReadStream(feed).pipe(new FeedParser())
    .on('readable', function () {
      var item;
      while ((item = this.read())) {
        links.push(item.link);
      }
    })
    .on('error', function (err) {
      assert.ifError(err);
      done(err);
    })
    .on('end', function () {
      assert.equal(links[0], '/livewire/hannity-announces-fox-hired-sebastian-gorka-national-security-strategist');
      assert.equal(links[1], '/edblog/were-hiring-senior-editor');
      assert.equal(links.length, 20);
      done();
    });
  });

  it('should resolve relative URI item links in RSS with feedurl option', function (done) {
    var feed = __dirname + '/feeds/rss-with-relative-urls.xml';
    var links = [];

    fs.createReadStream(feed).pipe(new FeedParser({ feedurl: 'http://www.arcgames.com' }))
      .on('readable', function () {
        var item;
        while ((item = this.read())) {
          links.push(item.link);
        }
      })
      .on('error', function (err) {
        assert.ifError(err);
        done(err);
      })
      .on('meta', function (meta) {
        assert.equal('http://www.arcgames.com/en/games/neverwinter/news', meta.link);
        assert.equal('http://www.arcgames.com/en/games/neverwinter/news/rss', meta.xmlurl);
      })
      .on('end', function () {
        assert.equal(links[0], 'http://www.arcgames.com/en/games/neverwinter/news/detail/10743874-neverwinter-%26-jingle-jam-humble-bundle%21');
        assert.equal(links[1], 'http://www.arcgames.com/en/games/neverwinter/news/detail/10738994-2x-underdark-currency-%26-15%25-off-bags%21');
        assert.equal(links.length, 2);
        done();
      });
  });

  it('should resolve relative URI item links in RSS if absolute xmlurl is present', function (done) {
    var feed = __dirname + '/feeds/rss-with-relative-urls-with-absolute-xmlurl.xml';
    var links = [];

    fs.createReadStream(feed).pipe(new FeedParser())
      .on('readable', function () {
        var item;
        while ((item = this.read())) {
          links.push(item.link);
        }
      })
      .on('error', function (err) {
        assert.ifError(err);
        done(err);
      })
      .on('meta', function (meta) {
        assert.equal('http://www.arcgames.com/en/games/neverwinter/news', meta.link);
        assert.equal('http://www.arcgames.com/en/games/neverwinter/news/rss', meta.xmlurl);
      })
      .on('end', function () {
        assert.equal(links[0], 'http://www.arcgames.com/en/games/neverwinter/news/detail/10743874-neverwinter-%26-jingle-jam-humble-bundle%21');
        assert.equal(links[1], 'http://www.arcgames.com/en/games/neverwinter/news/detail/10738994-2x-underdark-currency-%26-15%25-off-bags%21');
        assert.equal(links.length, 2);
        done();
      });
  });

});

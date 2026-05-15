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

  it('should resolve relative URI item links with blank string xml:base', function (done) {
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
      assert.equal(links[0], 'http://talkingpointsmemo.com/livewire/hannity-announces-fox-hired-sebastian-gorka-national-security-strategist');
      assert.equal(links[1], 'http://talkingpointsmemo.com/edblog/were-hiring-senior-editor');
      assert.equal(links.length, 20);
      done();
    });
  });

  it('should resolve relative URI item links with fragment-only xml:base', function (done) {
    var feed = __dirname + '/feeds/tpm-with-fragment-base.atom';
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

  it('should resolve relative URLs in embedded item HTML with xml:base', function (done) {
    var feed = __dirname + '/feeds/rss-with-relative-html-urls.xml';
    var descriptions = [];

    fs.createReadStream(feed).pipe(new FeedParser())
      .on('readable', function () {
        var item;
        while ((item = this.read())) {
          descriptions.push(item.description);
        }
      })
      .on('error', function (err) {
        assert.ifError(err);
        done(err);
      })
      .on('end', function () {
        assert.equal(descriptions[0], '<p><a href="https://example.com/posts/post-1">Read</a><a href="https://example.com/posts/post-1#comments">Comments</a><img src="https://example.com/images/post-1.png" srcset="https://example.com/posts/small.png 480w, https://example.com/large.png 2x"><video poster="https://example.com/posts/poster.png"></video></p>');
        done();
      });
  });

  it('should resolve relative URLs in embedded item HTML with an inferred base', function (done) {
    var feed = __dirname + '/feeds/rss-with-relative-html-urls-no-base.xml';
    var items = [];

    fs.createReadStream(feed).pipe(new FeedParser())
      .on('readable', function () {
        var item;
        while ((item = this.read())) {
          items.push(item);
        }
      })
      .on('error', function (err) {
        assert.ifError(err);
        done(err);
      })
      .on('end', function () {
        assert.equal(items[0].link, 'https://example.com/feed/posts/post-1');
        assert.equal(items[0].description, '<p><a href="https://example.com/feed/post-1">Read</a><a href="https://example.com/feed/#comments">Comments</a><img src="https://example.com/images/post-1.png" srcset="https://example.com/feed/small.png 480w, https://example.com/large.png 2x"><video poster="https://example.com/feed/poster.png"></video></p>');
        done();
      });
  });

  it('should resolve relative URLs in embedded item HTML with feedurl option', function (done) {
    var feed = __dirname + '/feeds/rss-with-relative-html-urls-no-base.xml';
    var descriptions = [];

    fs.createReadStream(feed).pipe(new FeedParser({ feedurl: 'https://example.com/feed/' }))
      .on('readable', function () {
        var item;
        while ((item = this.read())) {
          descriptions.push(item.description);
        }
      })
      .on('error', function (err) {
        assert.ifError(err);
        done(err);
      })
      .on('end', function () {
        assert.equal(descriptions[0], '<p><a href="https://example.com/feed/post-1">Read</a><a href="https://example.com/feed/#comments">Comments</a><img src="https://example.com/images/post-1.png" srcset="https://example.com/feed/small.png 480w, https://example.com/large.png 2x"><video poster="https://example.com/feed/poster.png"></video></p>');
        done();
      });
  });

  it('should not use item xml:base for sibling embedded item HTML', function (done) {
    var feed = __dirname + '/feeds/rss-with-item-scoped-html-base.xml';
    var descriptions = [];

    fs.createReadStream(feed).pipe(new FeedParser())
      .on('readable', function () {
        var item;
        while ((item = this.read())) {
          descriptions.push(item.description);
        }
      })
      .on('error', function (err) {
        assert.ifError(err);
        done(err);
      })
      .on('end', function () {
        assert.equal(descriptions[0], '<p><a href="https://example.com/first/post">First</a></p>');
        assert.equal(descriptions[1], '<p><a href="https://example.com/post">Second</a></p>');
        done();
      });
  });

  it('should not resolve relative URLs in embedded item HTML when normalize is false', function (done) {
    var feed = __dirname + '/feeds/rss-with-relative-html-urls.xml';
    var descriptions = [];

    fs.createReadStream(feed).pipe(new FeedParser({ normalize: false }))
      .on('readable', function () {
        var item;
        while ((item = this.read())) {
          descriptions.push(item['rss:description']['#']);
        }
      })
      .on('error', function (err) {
        assert.ifError(err);
        done(err);
      })
      .on('end', function () {
        assert.equal(descriptions[0], '<p><a href="post-1">Read</a><a href="#comments">Comments</a><img src="/images/post-1.png" srcset="small.png 480w, /large.png 2x"><video poster="poster.png"></video></p>');
        done();
      });
  });

});

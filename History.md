
2.2.10 / 2020-05-01
==================

  * Changes a direct use of hasOwnProperty builtin to call it from Object.prototype instead
  * Update mri
  * Update readable-stream
  * Update npm audit fixes
  * Remove unused Makefile
  * Update examples to use node-fetch in place of request
  * Update mocha v7
  * Update eslint v6
  * Replace iconv with iconv-lite
  * Update travis config; drop support for unmaintained node versions
  * Merge pull request #271 from jakutis/readme-use-https
  * README: make links use https: instead of http: protocol
  * Update copyright
  * Update README
  * Merge pull request #255 from danmactough/greenkeeper/mocha-5.0.0
  * chore(package): update mocha to version 5.0.0

2.2.9 / 2018-01-27
==================

  * Skip illegally-nested items
  * Add failing test for illegally nested items

2.2.8 / 2018-01-07
==================

  * Fix meta['#ns'] array to avoid duplicates

2.2.7 / 2017-12-11
==================

  * Enhance cli to take feedparser options as cli parameters
  * Improve relative url resolution in RSS feeds
  * Add issue template
  * Add link to Dave Winer's demo to README

2.2.6 / 2017-12-10
==================

  * Prioritize alternate links for item.link

2.2.5 / 2017-12-09
==================

  * Fix reresolve helper to correctly resolve relative URLs in RSS channel image

2.2.4 / 2017-11-08
==================

  * Fix reresolve logic
  * Add failing test - no reresolving first link in feed
  * Add a test assertion for xml base resolution

2.2.3 / 2017-10-25
==================

  * Update npm package to minimize dist size

2.2.2 / 2017-10-12
==================

  * Update devDependencies
  * Update sax v1.2.4
  * Update travis - node 7->8
  * Make sure that all links are parsed, not only text/html
  * docs(readme): add Greenkeeper badge
  * chore(package): update dependencies

2.2.1 / 2017-06-22
==================

  * fix: pin sax to 1.2.3
  * Update mocha to version 3.4.1

2.2.0 / 2017-04-11
==================

  * support for g:image_link attribute

2.1.0 / 2017-01-18
==================

  * Keep optional media:content attributes in the enclosures default property

2.0.0 / 2016-12-26
==================

  * Make bin script useful as command line tool and rename to "feedparser"
  * Add lint script and run lint before tests
  * Update README to clarify the importance of the compressed example
  * Drop support for Node 0.10 and 0.12
  * Fix xml declaration parsing to handle extra whitespace
  * Fix assignment by reference in options parsing
  * Remove unnecessary method
  * Replace bespoke helpers with lodash equivalents where possible
  * Move feedparser to lib
  * Move helpers lib
  * Remove weird comment
  * Update copyright
  * Update addressparser v1.0.1
  * Update dependecy readable-stream v2.2.2 and update tests to conform to api change
  * Update dev-dependency (iconv v2.2.1)
  * Update dev-dependency (mocha v3.2.0)
  * Add eslint/editorconfig and linting

1.1.5 / 2016-09-24
==================

  * Handles line breaks in xml declaration.
  * Update README to remove suggestion to use IRC
  * Add Gitter badge
  * Update examples to work with current versions of request module

1.1.4 / 2015-10-24
==================

  * Display nested objects.

1.1.3 / 2015-06-12
==================

  * Prefer atom link elements with type=text/html

1.1.2 / 2015-06-02
==================

  * Be more careful about assigning item.link from atom:link elements

1.1.1 / 2015-05-28
==================

  * Add license attribute

1.1.0 / 2015-05-21
==================

  * Fix channel link selection when there is a mixture of rss and atom. Closes #142

1.0.1 / 2015-04-07 
==================

 * Fix category parsing to avoid null in results. Resolves #136

1.0.0 / 2015-02-26 
==================

 * Bump mocha devDependency to v2.1.x
 * Cleanup package.json
 * Update copyright year in README
 * Remove node v0.8 support
 * Merge pull request #134 from designfrontier/master
 * added a testing environment for node v0.12
 * removed resanitize as a dependency since the only thing in use was a 4 line function. Moved the function to utils

v0.19.2 / 2014-09-02
==================

 * Change ispermalink value check to be case-insensitive. Closes #123.
 * Whoops. Remove debugging from example

v0.19.1 / 2014-07-31
==================

 * Add compressed example
 * Refactor iconv example

v0.19.0 / 2014-07-30
==================

 * Remove unnecessary code to trigger saxparser error. Apparently, calling the callback with an error will trigger an error anyway. Totally undocumented. So, this was actually calling double error emitting.
 * Manually trigger end when an exception is caught. We can't continue parsing after an exception is thrown. Also update test.
 * Use native try/catch. Other method is not a performance enhancement.
 * Wrap sax write and end methods in try/catch. Resolves #112 sax >= v0.6.0 can throw if a gzipped data stream containing certain characters gets written to the parser. This is a user error (to pipe gzipped data), but sometimes servers send gzipped data even when you've told them not to. So, we try to let the user handle this more gracefully.
 * Add failing test case for sax throwing

v0.18.1 / 2014-06-20
==================

 * Don't assume el is not an array when defining attrs hash. Resolves #113
 * Add failing test for #113

v0.18.0 / 2014-06-18
==================

 * Enforce de-duping on atom enclosures
 * Fix modification by reference defeating indexOf checking
 * Fix inverted index checking
 * Update test and fixture with tougher test case suggested by #111
 * Revert "test for different enclosure type"
 * test for different enclosure type

v0.17.0 / 2014-05-27
==================

 * Improve tests
 * Use readable-stream instead of core stream; update dependencies.
 * Update README
 * Add permalink property for RSS feeds
 * Add nodeico badge
 * Remove unnecessary test server
 * Only colorize dump output if outputing to a terminal.
 * Fix small typo.

v0.16.6 / 2014-02-12
==================

 * Update README to improve example code.
 * Fix error check in handleEnd method.
 * Remove unused dependency.
 * Add to namespaces and prettify.
 * Update iconv example to remove event-stream dependency.
 * Cleanup iconv example
 * Add gitignore
 * Merge branch 'kof-iconv'
 * Refactor iconv example to be more explicit.
 * Create a localhost server for example.
 * Refactor getParams method.
 * Move tips for url fetching to example script
 * Remove gitignore
 * complicated example using iconv and request

v0.16.5 / 2013-12-29
==================

 * Workaround addressparser failing to parse strings ending with a colon. Closes #94.

v0.16.4 / 2013-12-26
==================

 * Fix bad logic setting meta.image properties.
 * Fix TypeError in utils.reresolve failing to check for existence of parameter. Resolves #92.

v0.16.3 / 2013-10-27
==================

 * Merge remote-tracking branch 'PaulMougel/master'
 * Updated readable side highWaterMark to be forward-compatible with node.
 * Improved stream watermark and buffering.
 * Reduced memory consumption.

v0.16.2 / 2013-10-08
==================

 * Bump dependencies
 * Merge pull request #75 from jcrugzz/request-depend
 * [fix] remove unneeded dependency `request`
 * Update README.md
 * Update example code

v0.16.1 / 2013-06-13
==================

  * Update travis config
  * Only emit meta once. title is a required channel element, so a feed without it is broken, but emitting more than once is still a no-no. Closes #69
  * Bump version: v0.16.0
  * Update README
  * Remove legacy libxml-like helpers
  * Update dump script
  * Update examples
  * Update tests
  * Emit SAXErrors and allow consumer to handle or bail on SAXErrors
  * Update copyright notices
  * Merge branch 'AndreasMadsen-transform-stream'
  * Change stream test to not require additional dependency
  * make feedparser a transform stream

v0.16.0 / 2013-06-11
==================

  * Update README
  * Remove legacy libxml-like helpers
  * Update dump script
  * Update examples
  * Update tests
  * Emit SAXErrors and allow consumer to handle or bail on SAXErrors
  * Update copyright notices
  * Merge branch 'AndreasMadsen-transform-stream'
  * Change stream test to not require additional dependency
  * make feedparser a transform stream

v0.15.8 / 2013-10-08 
==================

 * Fix package.json

v0.15.7 / 2013-09-26 
==================

 * Bump dependencies

v0.15.6 / 2013-09-24 
==================

 * Bump dependencies
 * Update travis config

v0.15.5 / 2013-06-13
==================

  * Only emit meta once. title is a required channel element, so a feed without it is broken, but emitting more than once is still a no-no. Closes #69
  * Update copyright notices

v0.15.4 / 2013-06-04
==================

  * Fix processing instruction handler to avoid interpretting extraneouso whitespace as attribute names.
  * Use item source for xmlurl, if absent. Closes #63
  * Add more xml:base fallbacks. Resolves #64
  * Merge branch 'unexpected-arrays'
  * Fix date parsing. Don't trust that the dates are not arrays.
  * Make tests run on v0.10. Closes #61.

v0.15.3 / 2013-05-05
==================

  * Update README to point to contributors graph
  * Merge pull request #59 from AndreasMadsen/rss-category
  * do not seperate rss catgories by comma

v0.15.2 / 2013-04-16
==================

  * Be more forgiving of poorly-formatted feeds. Closes #58

v0.15.1 / 2013-04-15
==================

  * Fix for no Content-Type header

v0.15.0 / 2013-04-11
==================

  * Tweak #content-type; add #xml to meta
  * Tweak stream api test
  * Fix missing scope
  * Linting
  * Fix typo in README code example
  * Update README to add link to Issues page and IRC

v0.14.0 / 2013-03-25
==================

  * Update examples
  * Update README
  * Remove nextEmit. Only use nextTick on parseString (other methods don't need it).
  * Remove _setCallback and set the callback directly. Don't use nextTick.
  * Add basic test for writable stream input api
  * Add basic tests for callback and event apis
  * Implement naive v0.8-style Stream API
  * Fix README (incorrect stream pipe examples)
  * Merge pull request #52 from supahgreg/master
  * Correcting a typo in README.md

v0.13.4 / 2013-03-15
==================

  * Fix unsafe usage of 'in' when variable may be not an object. Closes #51.

v0.13.3 / 2013-03-14
==================

  * Fix reresolve function to not assume that node property is a string. Closes #50.

v0.13.2 / 2013-02-21
==================

  * Fix issue where namespaced elements with the same local part as a root element were being treated as having the save name, e.g., atom:link in an rss feed being part of the 'link' element.
  * Remove stray console.log from test

v0.13.1 / 2013-02-21
==================

  * Deal with the astonishing fact that someone thinks a feed with 4 diffenet cloud/pubsubhubub elements is helpful. Resolves #49.

v0.13.0 / 2013-02-18
==================

  * Remove old API. Update docs, examples and tests.
  * Fix .parseUrl url parameter processing. Throw early if no valid url is given. Also pass all options to request. Add tests. Closes #44 and #46.
  * Add url to error when possible. Change "Not a feed" error message because it's not always a remote server. Update tests. Closes #43."
  * Raise default sax.MAX_BUFFER_LENGTH to 16M and allow it to be set in options. Closes #38.
  * Strip HTML from `meta.title`, `meta.description` and `item.title`

v0.12.0 / 2013-02-12
==================

  * Expose rssCloud/pubsubhubbub on `meta.cloud` property. Resolves #47.
  * Expose "has" util

v0.11.0 / 2013-02-03
==================

  * Dedupe enclosures. Resolves #45.
  * Change test to be more lenient about which error code is returned as it seems to differ for no known reason
  * Drop support for node pre-v0.8.x
  * Refactor tests to not fetch remote URLs
  * Tell TravisCI to only run tests on master
  * Enable silencing the deprecation warnings

v0.10.13 / 2013-01-08
==================

  * Bump sax version

v0.10.12 / 2012-12-31
==================

  * Expose HTTP response on FeedParser instance

v0.10.11 / 2012-12-28
==================

  * Update tests
  * Change HTTP Content-Type head checking to allow parsing valid feeds with incorrect Content-Type header. Add value of Content-Type header to meta.

v0.10.10 / 2012-12-28
==================

  * Add example and test for passing request headers to .parseUrl()
  * Enable FeedParser.parseUrl to accept a Request object with headers
  * Update utils.merge() to be safer about relying on Object properties
  * Skip failing test that's not failing. Maybe the remote server changed something.
  * Cleanup 5f642af. Don't overwrite media:thumbnail array.
  * Increase test timeout. Fix incorrect test usage of deepEqual instead of strictEqual.
  * Merge pull request #41 from rborn/master
  * fix for multiple media:thumbnail
  * Add test for fetching uncompressed feed.

v.0.10.9 / 2012-12-03
==================

  * Add "Accept-Encoding: identity" header on HTTP requests to only fetch uncompressed data. Resolves issue #36.
  * Merge pull request #37 from jchris/patch-1
  * make example work with new api

v0.10.8 / 2012-11-06
==================

  * Ensure we only emit `end` once. Bump version.
  * Change FeedParser.parseStream so it doesn't try to attach to a `stream` that is not defined. A user could pass in a stream thinking it's valid, but the stream has been destroyed. Try not to throw.
  * Change FeedParser#handleError to not remove 'error' listeners on `this.stream`

v0.10.7 / 2012-11-01
==================

  * Fix issue #34 .parseString() emitting too soon. All `emit()` and `callback()` are wrapped in `process.nextTick()`. Bump version.

v0.10.6 / 2012-10-27
==================

  * Fix issue #33 uncaught exception trying to get the text string for an HTTP status code.

v0.10.5 / 2012-10-26
==================

  * Bump version. Update README with additional dependency. Add History.md.
  * Fix issue #32 - parse RSS item:author. Enhance RSS authorish elements with parsed properties via addressparser.

v0.10.4 / 2012-10-25
==================

  * Bump version
  * Fix major bug in parseString, parseFile, and parseStream -- failed to return the event emitter.
  * Refactor dump script to use new API
  * Fix dump script for API change

v0.10.3 / 2012-10-24
==================

  * Bump version
  * Update documentation
  * Rename 'notModified' event to '304'
  * Add deprecation warnings to prototype methods. Reorganize .parseUrl and handleResponse.
  * Update tests for new static methods
  * Fix initialization of saxstream. Rename parser to feedparser. Add doc to parseString static.
  * Refactor options and init parsing. Refine error handling. Fix bug in handleSaxError. Add static methods for parseString, parseFile and parseStream.
  * Initial refactor of error handling
  * Reorganize some code
  * Rename FeedParser#_reset to FeedParser#init
  * Change module.exports to use an instance of FeedParser. Add non-prototype-based parseUrl.
  * :gem: Travis CI image/link in readme :gem:
  * :gem: Added travis.yml file :gem:

v0.10.2 / 2012-10-17
==================

  * Add static callback methods
  * Move reresolve to utils
  * Update inline documentation of public api
  * Bump version
  * Refactor (part 2) to eliminate scope-passing (just moves things around in the class)
  * Refactor (part 1) to eliminate scope-passing

v0.10.1 / 2012-10-05
==================

  * Bump version. Fix issue #25; add test. Add ability to pass "strict" boolean option to Sax.
  * Fix failing test

v0.10.0-beta / 2012-09-13
==================

  * Mark package as beta version
  * Add more namespaces and sort sort-of alphabetically
  * Add brief description and usage info
  * Bump version
  * Add more namespaces
  * Handle namespaced elements that use nondefault namespace prefixes
  * Add more namespace-awareness tests
  * Add test for issue #23 (non-default namespaces)
  * Refactor to handle use of nondefault namespaces
  * Add Makefile to run tests
  * Add nsprefix function for getting the "default" prefix for a given namespace uri.
  * Add 'xml' to default namespaces lookup table.
  * Add nslookup function for checking whether a uri matches the default for a namespace.
  * Add default namespaces lookup table.
  * Add script to dump parsed feeds to console. Useful for debugging.


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

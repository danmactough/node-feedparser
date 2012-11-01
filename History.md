
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

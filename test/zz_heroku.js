
/**
 * Removes a module from the cache. We need this to re-load our http_request !
 * see: http://stackoverflow.com/a/14801711/1148249
 */
require.uncache = function (moduleName) {
    // Run over the cache looking for the files
    // loaded by the specified module name
    require.searchCache(moduleName, function (mod) {
        delete require.cache[mod.id];
    });

    // Remove cached paths to the module.
    // Thanks to @bentael for pointing this out.
    Object.keys(module.constructor._pathCache).forEach(function(cacheKey) {
        if (cacheKey.indexOf(moduleName)>0) {
            delete module.constructor._pathCache[cacheKey];
        }
    });
};

/**
 * Runs over the cache to search for all the cached
 * files
 */
require.searchCache = function (moduleName, callback) {
    // Resolve the module identified by the specified name
    var mod = require.resolve(moduleName);

    // Check if the module has been resolved and found within
    // the cache
    if (mod && ((mod = require.cache[mod]) !== undefined)) {
        // Recursively go over the results
        (function run(mod) {
            // Go over each of the module's children and
            // run over it
            mod.children.forEach(function (child) {
                run(child);
            });

            // Call the specified callback providing the
            // found module
            callback(mod);
        })(mod);
    }
};
/* */
var test  = require('tape');
var chalk = require('chalk');


test(chalk.cyan('CONNECT to ES on HEROKU!'), function (t) {
  // please don't spam this SearchBox ElasticSearch account with Records!
  // Its JUST for Testing this module! thanks! :-)
  process.env.SEARCHBOX_SSL_URL = 'https://paas:177117314d80d98671aaffd7fb9a314b@kili-eu-west-1.searchly.com'
  var ES_URL = process.env.SEARCHBOX_SSL_URL || '127.0.0.1:9200';
  // https://nodejs.org/docs/latest/api/globals.html#globals_require_cache
  require.uncache('../lib/index'); // reload http_request sans SSL! (localhost)
  var ES = require('../lib/index');
  ES.CONNECT(function (res) {
    console.log(res);
    t.equal(res.status, 200, chalk.green("✓ Status 200 - OK"));
    t.end();
  });
});

test(chalk.cyan('Force HTTP Error with bad UN:PW'), function (t) {
  // please don't spam this SearchBox ElasticSearch account with Records!
  // Its JUST for Testing this module! thanks! :-)
  process.env.SEARCHBOX_SSL_URL = 'https://un:pw@kili-eu-west-1.searchly.com'
  var ES_URL = process.env.SEARCHBOX_SSL_URL || '127.0.0.1:9200';
  // https://nodejs.org/docs/latest/api/globals.html#globals_require_cache
  require.uncache('../lib/index'); // reload http_request sans SSL! (localhost)
  var ES = require('../lib/index');
  ES.CONNECT(function (res) {
    console.log(res);
    t.equal(res.status, 'error', chalk.green("✓ Error forced. (we wanted this!)"));
    t.end();
  });
});

test(chalk.cyan('Exercise http_request req.on("error") handler'), function (t) {
  var options = {
    host: '127.0.0.1',
    port: '81',
    path: '/',
    method: 'SET'
  }
  // https://nodejs.org/docs/latest/api/globals.html#globals_require_cache
  require.uncache('../lib/http_request'); // reload http_request sans SSL! (localhost)
  var REQUEST = require('../lib/http_request');
  var ES = require('../lib/index');
  REQUEST(options, function (res) {
    // console.log(res.code);
    t.equal(res.code, 'ECONNREFUSED', chalk.green("✓ 'ECONNREFUSED' Error forced. (we wanted this!)"));
    t.end();
  });
});

/**
 * Helper module for Mocha-testing the lep-API.
 *
 * Reads, then executes the lep-API and all mock JS-files in the current node context,
 * so anything defined inside the files will be available within Mocha tests.
 *
 * Author: Lennart Pegel - https://github.com/justlep/bitwig
 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
 *
 * Example:
 * $ require('./../loadApiAndMocks');
 * $ lep.util.formatString('hallo {}', 'du');
 *
 * (Used Mocha to avoid the overhead of PhantomJS-based test runners like Karma & co)
 */

'use strict';

let vm = require('vm'),
    path = require('path'),
    fs = require('fs'),
    grunt = require('grunt'),
    projectRootPath = path.resolve(__dirname, '..'),
    getApiPath = function(relativePath) {
        return path.resolve(__dirname, '../src/lep/', relativePath);
    },
    apiLoaderSource = fs.readFileSync(getApiPath('api.js'), 'utf8'),
    filesToExecute = grunt.file.expand({
        cwd: projectRootPath,
        filter: 'isFile'
    }, 'test/mocks/**/*.js').map(relativePath => path.resolve(projectRootPath, relativePath));


apiLoaderSource.replace(/^load.'([^']*)'./gm, function (fullMatch, relativeJsFilePath) {
    filesToExecute.push(getApiPath(relativeJsFilePath));
});

// Execute all files in the current VM context..
filesToExecute.forEach(absoluteFilePath => {
    let relativeFilePath = path.relative(projectRootPath, absoluteFilePath);
    console.log('# Loading: ' + relativeFilePath);
    vm.runInThisContext(fs.readFileSync(absoluteFilePath));
});


/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var fs = require('fs-extra');
var gulp = require('gulp');
var path = require('path');
var webserver = require('gulp-webserver');


gulp.task('copy_dependencies', function() {
  var libDir = 'lib';
  if (!fs.existsSync('lib')) { fs.mkdirSync('lib'); }

  var filesToCopy = [
    // JS dependencies
    'bower_components/bootstrap/dist/js/bootstrap.min.js',
    'bower_components/bootstrap-table/dist/bootstrap-table.min.js',
    'bower_components/jquery/dist/jquery.min.js',
    'bower_components/lovefield/dist/lovefield.js',
    'bower_components/lovefield/dist/lovefield.min.js',

    // CSS dependencies
    'bower_components/bootstrap/dist/css/bootstrap.min.css',
    'bower_components/bootstrap-table/src/bootstrap-table.css'
  ];

  filesToCopy.forEach(function(file) {
    fs.copySync(file, path.join(libDir, path.basename(file)));
  });
});


gulp.task('default', ['copy_dependencies']);


gulp.task('clean', function() {
  var foldersToDelete = [
    'lib'
  ];

  foldersToDelete.forEach(function(folder) {
    if (fs.existsSync(folder)) {
      fs.removeSync(folder);
    }
  });
});


gulp.task('webserver', function() {
  gulp.src('.').pipe(webserver({
    livereload: true,
    directoryListing: true,
    open: false
  }));
});


gulp.task('export', ['default'], function() {
  var binDir = 'bin';

  if (!fs.existsSync(binDir)) { fs.mkdirSync(binDir); }
  fs.copySync('lib', path.join(binDir, 'lib'));
  fs.copySync('data', path.join(binDir, 'data'));

  var filesToCopy = [
    'demo-binding.html',
    'demo-binding.js',
    'demo.html',
    'demo-jquery.html',
    'demo-jquery.js',
    'demo-pureidb.html',
    'demo-pureidb.js',
    'schema.js'
  ];

  var copyFile = function(file) {
    fs.copySync(file, path.join(binDir, path.basename(file)));
  };

  filesToCopy.forEach(copyFile);
});

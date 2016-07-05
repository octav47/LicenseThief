'use strict';

var appConf = require('./conf/app.js');

var gulp = require('gulp'),
    rimraf = require('rimraf');

gulp.task('output:clean:success', function (cb) {
    rimraf(appConf.output.success + '*', cb);
});

gulp.task('output:clean:problem', function (cb) {
    rimraf(appConf.output.problem + '*', cb);
});

gulp.task('output:clean:noGeoObj', function (cb) {
    rimraf(appConf.output.noGeoObj + '*', cb);
});

gulp.task('output:clean:geoData', function (cb) {
    rimraf(appConf.output.geoData + '*', cb);
});

gulp.task('output:clean:total', function (cb) {
    rimraf(appConf.output.path + '*.json', cb);
});

gulp.task('clean output', [
    'output:clean:success',
    'output:clean:problem',
    'output:clean:noGeoObj',
    'output:clean:geoData',
    'output:clean:total'
]);
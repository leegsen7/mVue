var gulp = require('gulp');
var browserSync = require('browser-sync').create();
// Static server
gulp.task('browser-sync', function() {
    var files = ['*.html','src/'];
    browserSync.init(files, {
        server: {
            baseDir: "./"
        },
        open: false,
        port: 4001,
    });
});
gulp.task('default', ['browser-sync']); //定义默认任务

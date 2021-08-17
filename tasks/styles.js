const Task = require('gloom/Task');
const Gulp = require('gulp');
const Sass = require('gulp-sass')(require('sass'));
const Rename = require('gulp-rename');
const Path = require('path');

module.exports = class StylesTask extends Task {

  key() {
    return 'styles';
  }

  tags() {
    return ['watcher'];
  }

  defaultConfig() {
    return {
      styles: {
        files: [
          'src/comps/**/*.sass',
          '!src/comps/**/_*.sass'
        ],
        includes: './src/includes',
        dest: './dist/styles',
        watch: 'src/comps/**/*.sass',
      },
    };
  }

  task(config, manager) {
    Gulp.task('styles', function stylesCompile() {
      return Gulp.src(config.styles.files)
        .pipe(Sass.sync({
          includePaths: config.styles.includes,
          outputStyle: 'compressed'
        }).on('error', Sass.logError))
        .pipe(Rename(function(path) {
          path.dirname = '';
          path.extname = '.min.css';
        }))
        .pipe(Gulp.dest(config.styles.dest));
    });

    Gulp.task('styles:watch', Gulp.series('styles', function stylesWatch(cb) {
      Gulp.watch(config.styles.watch, Gulp.parallel('styles'))
        .on('change', function(path) {
          console.log('Trigger "styles" by changing "' + Path.basename(path) + '"');
        });

      return cb();
    }));
  }

};

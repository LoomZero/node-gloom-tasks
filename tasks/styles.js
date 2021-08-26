const Task = require('gloom/Task');
const Gulp = require('gulp');
const Sass = require('gulp-sass')(require('sass'));
const Rename = require('gulp-rename');
const Path = require('path');
const Dependents = require('gulp-dependents')
const Autoprefixer = require('gulp-autoprefixer');

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
          '!src/comps/**/_*.sass',
        ],
        includes: './src/includes',
        dest: './dist/styles',
        watch: 'src/comps/**/*.sass',
      },
    };
  }

  task(config, manager) {
    Gulp.task('styles', function stylesCompile() {
      return Gulp.src(config.styles.files, { since: Gulp.lastRun('styles') })
        .pipe(Dependents())
        .pipe(Sass.sync({
          includePaths: config.styles.includes,
          outputStyle: 'compressed'
        }).on('error', Sass.logError))
        .pipe(Autoprefixer({
          grid: autoplace,
        }))
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

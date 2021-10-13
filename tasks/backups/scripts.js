const Plugin = require('gloom/Plugin');

const Gulp = require('gulp');
const Uglify = require('gulp-uglify');
const Rename = require('gulp-rename');
const Path = require('path');

module.exports = class ScriptsPlugin extends Plugin {

  init() {
    this.info.addWatcher('scripts:watch');
  }

  get plugin() {
    return 'scripts';
  }

  get config() {
    return {
      files: [
        'src/comps/**/*.js',
        '!src/comps/**/_*.js'
      ],
      dest: './dist/scripts',
      watch: 'src/comps/**/*.js',
    };
  }

  define() {
    Gulp.task('scripts', () => {
      return Gulp.src(this.config.files, { since: Gulp.lastRun('scripts') })
        .pipe(Uglify().on('error', console.log))
        .pipe(Rename(function(path) {
          path.dirname = '';
          path.extname = '.min.js';
        }))
        .pipe(Gulp.dest(this.config.dest));
    });

    Gulp.task('scripts:watch', Gulp.series('scripts', function scriptsWatch(cb) {
      Gulp.watch(this.config.watch, Gulp.parallel('scripts'))
        .on('change', function(path) {
          console.log('Trigger "scripts" by changing "' + Path.basename(path) + '"');
        });

      return cb();
    }));
  }

};

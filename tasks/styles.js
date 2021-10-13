const Plugin = require('gloom/Plugin');
const Gulp = require('gulp');
const Sass = require('gulp-sass')(require('sass'));
const Rename = require('gulp-rename');
const Path = require('path');
const Dependents = require('gulp-dependents');

module.exports = class StylesPlugin extends Plugin {

  init() {
    this.info.addWatcher('styles:watch');
  }

  get plugin() {
    return 'styles';
  }

  get config() {
    return {
      files: [
        'src/comps/**/*.sass',
        '!src/comps/**/_*.sass',
      ],
      includes: './src/includes',
      dest: './dist/styles',
      watch: 'src/comps/**/*.sass',
      autoprefixer: {},
    };
  }

  define() {
    console.log('define');
    Gulp.task('styles', () => {
      let pipeline = Gulp.src(this.config.files, { since: Gulp.lastRun('styles') })
        .pipe(Dependents())
        .pipe(Sass.sync({
          includePaths: this.config.includes,
          outputStyle: 'compressed'
        }).on('error', Sass.logError));

      if (this.config.autoprefixer !== false) {
        let Autoprefixer = null;
        try {
          Autoprefixer = require('gulp-autoprefixer');
        } catch (e) {}
        if (Autoprefixer !== null) {
          pipeline = pipeline.pipe(Autoprefixer(this.config.autoprefixer));
        }
      }

      return pipeline.pipe(Rename(function(path) {
          path.dirname = '';
          path.extname = '.min.css';
        }))
        .pipe(Gulp.dest(this.config.dest));
    });

    Gulp.task('styles:watch', Gulp.series('styles', (cb) => {
      Gulp.watch(this.config.watch, Gulp.parallel('styles'))
        .on('change', function(path) {
          console.log('Trigger "styles" by changing "' + Path.basename(path) + '"');
        });

      return cb();
    }));
  }

};

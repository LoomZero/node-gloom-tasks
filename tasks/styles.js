const Task = require('gloom-plugin/Task');
const Gulp = require('gulp');
const Sass = require('gulp-sass');
const Rename = require("gulp-rename");
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
          'src/**/*.sass',
          '!./src/vendor/**/*.sass',
          '!./src/variables/*.sass',
          '!src/**/_*.sass'
        ],
        variables: './src/variables',
        dest: './built/styles',
        watch: 'src/**/*.sass',
      },
    };
  }

  task(config, manager) {
    const vendorpath = manager.path(config.vendor, 'vendor.json');

    Gulp.task('styles:vendor', function(cb) {
      delete require.cache[vendorpath];
      const vendor = require(vendorpath);
      const styles = (vendor.styles || []).map((path) => Path.join(config.vendor, path));

      if (!styles.length) return cb();

      return Gulp.src(styles)
        .pipe(Rename(function(path) {
          path.dirname = 'vendor';
        }))
        .pipe(Gulp.dest(config.styles.dest));
    });

    Gulp.task('styles', Gulp.parallel('styles:vendor', function stylesCompile() {
      return Gulp.src(config.styles.files)
        .pipe(Sass({
          includePaths: config.styles.variables,
          outputStyle: 'compressed'
        }).on('error', Sass.logError))
        .pipe(Rename(function(path) {
          path.dirname = Path.normalize(path.dirname).split(Path.sep).shift();
          path.extname = '.min.css';
        }))
        .pipe(Gulp.dest(config.styles.dest));
    }));

    Gulp.task('styles:watch', Gulp.series('styles', function stylesWatch(cb) {
      Gulp.watch([...config.styles.watch, vendorpath], Gulp.parallel('styles'))
        .on('change', function(path) {
          console.log('Trigger "styles" by changing "' + Path.basename(path) + '"');
        });

      return cb();
    }));
  }

};

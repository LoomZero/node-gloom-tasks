const Task = require('gloom-plugin/Task')
const Gulp = require('gulp');
const Uglify = require('gulp-uglify');
const Rename = require('gulp-rename');
const Path = require('path');

module.exports = class ScriptsTask extends Task {

  key() {
    return 'scripts';
  }

  tags() {
    return ['watcher'];
  }

  defaultConfig() {
    return {
      scripts: {
        files: [
          'src/components/**/*.js',
          '!src/components/**/_*.js'
        ],
        dest: './dist/scripts',
        watch: 'src/components/**/*.js',
      },
    };
  }

  task(config, manager) {
    const vendorpath = manager.path(config.vendor, 'vendor.json');

    Gulp.task('scripts:vendor', function(cb) {
      delete require.cache[vendorpath];
      const vendor = require(vendorpath);
      const scripts = (vendor.scripts || []).map((path) => Path.join(config.vendor, path));

      if (!scripts.length) return cb();

      return Gulp.src(scripts)
        .pipe(Rename(function(path) {
          path.dirname = 'vendor';
        }))
        .pipe(Gulp.dest(config.scripts.dest));
    });

    Gulp.task('scripts', Gulp.parallel('scripts:vendor', function scriptsCompile() {
      return Gulp.src(config.scripts.files)
        .pipe(Uglify().on('error', console.log))
        .pipe(Rename(function(path) {
          path.dirname = Path.normalize(path.dirname).split(Path.sep).shift();
          path.extname = '.min.js';
        }))
        .pipe(Gulp.dest(config.scripts.dest));
    }));

    Gulp.task('scripts:watch', Gulp.series('scripts', function scriptsWatch(cb) {
      Gulp.watch([...config.scripts.watch, vendorpath], Gulp.parallel('scripts'))
        .on('change', function(path) {
          console.log('Trigger "scripts" by changing "' + Path.basename(path) + '"');
        });

      return cb();
    }));
  }

};

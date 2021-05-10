const Task = require('gloom/Task');
const Gulp = require('gulp');
const Changed = require('gulp-changed');

module.exports = class AssetsTask extends Task {

  key() {
    return 'assets';
  }

  defaultConfig() {
    return {
      assets: {
        dest: 'dist/assets',
        src: ['src/assets/**/*', '!src/assets/README.md'],
      },
    };
  }

  task(config, manager) {
    Gulp.task('assets', function() {
      return Gulp.src(config.assets.src)
        .pipe(Changed(config.assets.dest))
        .pipe(Gulp.dest(config.assets.dest));
    });
  }

};
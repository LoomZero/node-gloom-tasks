const Plugin = require('gloom/Plugin');
const Changed = require('gulp-changed');

module.exports = class AssetsPlugin extends Plugin {

  get plugin() {
    return 'assets';
  }

  get config() {
    return {
      dest: 'dist/assets',
      src: ['src/assets/**/*', '!src/assets/README.md'],
    };
  }

  define(Gulp) {
    Gulp.task('assets', () => {
      return Gulp.src(this.config.src)
        .pipe(Changed(this.config.dest))
        .pipe(Gulp.dest(this.config.dest));
    });
  }

};
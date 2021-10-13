const Plugin = require('gloom/Plugin');
const Gulp = require('gulp');

module.exports = class WatchPlugin extends Plugin {

  get plugin() {
    return 'watch';
  }

  get config() {
    return {
      default: [],
    };
  }

  define() {
    for (const mode in this.config) {
      const plugins = manager.getTaggedPlugins(['watcher', 'watcher:' + mode]);
      const tasks = [...this.config[mode]];
  
      for (const name in plugins) {
        const task = manager.findTask(plugins[name].key() + ':watch:' + mode, 2);
  
        if (task !== null) {
          tasks.push(task);
        }
      }
      if (tasks.length) {
        Gulp.task('watch:' + mode, Gulp.parallel(...tasks));
      }
    }
  
    Gulp.task('watch', Gulp.series('watch:default'));
  }

};

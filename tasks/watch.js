const Task = require('gloom-plugin/Task');
const Gulp = require('gulp');

module.exports = class WatchTask extends Task {

  key() {
    return 'watch';
  }

  defaultConfig() {
    return {
      watchers: {
        default: [],
      },
    };
  }

  task(config, manager) {
    for (const mode in config.watchers) {
      const plugins = manager.getTaggedPlugins(['watcher', 'watcher:' + mode]);
      const tasks = [...config.watchers[mode]];
  
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

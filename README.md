# How to create Custom Tasks

## NOTE: To install the compiler to your theme please follow the instrucstions for [node-gloom-cli](https://github.com/loomgmbh/node-gloom-cli)
If you came here to add your own task(s) follow the instructions below.

- create folder /themes/{themename}/tasks
- add your {task}.js into it
- you can change the order weight and/or add it to the default jobs by adding your taskname to the respective object in the gloom.json.
  
## Template for the lazy
```js
const Task = require('gloom/Task');
const Gulp = require('gulp');

module.exports = class YourCustomTask extends Task {

  key() {
    return '<yourtaskname>';
  }

  // ###
  // In case you want to add your task to the watcher
  // ###
  tags() {
    return ['watcher'];
  }
  
  task() {
    Gulp.task('<yourtaskname>', function yourCustomTaskFunction() {
       // your code 
    });


    // ###
    // Watch Command Example
    // ###
    Gulp.task('<yourtaskname>:watch', Gulp.series('<yourtaskname>', function yourCustomTaskWatchFunction(cb) {
      Gulp.watch(<yoursourcefiles>, Gulp.parallel('<yourtaskname>'))
        .on('change', function(path) {
          console.log('<yourtaskname>" did something"');
        });
    
      return cb();
    }));
  }

}
```

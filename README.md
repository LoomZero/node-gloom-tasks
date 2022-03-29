
---
**ABANDONED - DO NOT USE**

This project has moved to https://gitlab.loom.de/loom/node-modules/gloom-tasks 

---

# 1. - Gloom Tasks (ToC)

- [1. - Gloom Tasks (ToC)](#1---gloom-tasks-toc)
- [2. - Installation](#2---installation)
- [3. - Tasks](#3---tasks)
  - [3.1. - Styles](#31---styles)
    - [3.1.1. - Autoprefixer (peer)](#311---autoprefixer-peer)
- [4. - Custom Task](#4---custom-task)
  - [4.1. - Template for a custom task](#41---template-for-a-custom-task)
  - [4.2. - Use `gloom-cli`](#42---use-gloom-cli)

# 2. - Installation

:warning: To install the compiler to your theme please follow the instrucstions for [node-gloom-cli](https://github.com/loomgmbh/node-gloom-cli) :warning:

# 3. - Tasks

## 3.1. - Styles

### 3.1.1. - Autoprefixer (peer)

The autoprefixer for css is only loaded when you install `gulp-autoprefixer` in your theme.

# 4. - Custom Task

> To create a custom task use instructions below:

- create folder `/themes/{themename}/tasks`
- add your `{task}.js` into it
- you can change the order weight and/or add it to the default jobs by adding your taskname to the respective object in the `gloom.json` of the theme
  
## 4.1. - Template for a custom task
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

## 4.2. - Use `gloom-cli`

> To create a new task with `gloom-cli` use instructions below:

- use this command in your theme directory

```shell
gloom custom task create <taskname>
```

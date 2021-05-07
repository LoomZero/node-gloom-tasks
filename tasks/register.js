const Task = require('gloom-plugin/Task')
const Gulp = require('gulp');
const Glob = require('glob');
const Path = require('path');
const Yaml = require('js-yaml');
const FS = require('fs');

module.exports = class RegisterTask extends Task {

  key() {
    return 'register';
  }

  tags() {
    return ['watcher'];
  }

  defaultConfig() {
    return {
      register: {
        src: 'gulp/src/+(base|components)/**/*.+(sass|js|yml)',
        watch: {
          change: ['gulp/src/+(base|components)/**/*.yml'],
          link: ['gulp/src/+(base|components)/**/*.+(sass|js|yml)'],
        },
        headRegex: 'gulp\/src\/([^\/]*)',
        defaultType: {
          css: 'static',
          js: 'static',
        },
        types: {
          static: {
            minified: true,
            preprocess: false,
          },
          defer: {
            minified: true,
            preprocess: false,
            defer: true
          }
        },
      },
    };
  }

  task(config, manager) {
    Gulp.task('register', function(cb) {
      const theme = Path.basename(manager.path());
      const target = manager.path(theme + '.libraries.yml');
      const vendor = Yaml.load(FS.readFileSync(manager.path(config.vendor, 'vendor.yml')).toString());

      Glob(manager.path(config.register.src), function(error, files) {
        const data = {};

        for (const file of files) {
          const parse = Path.parse(file);
          const name = parse.name;

          parse.file = file;
          parse.head = file.match(config.register.headRegex)[1];
          data[name] = data[name] || {};
          data[name].name = name;
          data[name][parse.ext.substring(1)] = parse;
          if (parse.ext.substring(1) === 'yml') {
            data[name].info = Yaml.load(FS.readFileSync(file).toString());
          }
        }

        const yml = {};
        for (const item in vendor) {
          const entry = vendor[item];

          if (entry.css) {
            for (const type in entry.css) {
              for (const file in entry.css[type]) {
                if (typeof entry.css[type][file] === 'string') {
                  entry.css[type][file] = config.register.types[entry.css[type][file]];
                }

                if (!file.startsWith('http') && !file.startsWith('/')) {
                  const newName = 'built/styles/vendor/' + Path.basename(file);
                  entry.css[type][newName] = entry.css[type][file];
                  delete entry.css[type][file];
                }
              }
            }
          }
          if (entry.js) {
            for (const file in entry.js) {
              if (typeof entry.js[file] === 'string') {
                entry.js[file] = config.register.types[entry.js[file]];
              }

              if (!file.startsWith('http') && !file.startsWith('/')) {
                const newName = 'built/scripts/vendor/' + Path.basename(file);
                entry.js[newName] = entry.js[file];
                delete entry.js[file];
              }
            }
          }

          yml[item] = entry;
        }
        for (const name in data) {
          const entry = data[name];
          const info = entry.info && entry.info.library || {};
          const key = info.name || name;

          yml[key] = {};
          if (entry.sass) {
            yml[key].css = { component: {} };
            if (info.css !== undefined) {
              if (typeof info.css === 'string') {
                yml[key].css.component['built/styles/' + entry.sass.head + '/' + name + '.min.css'] = config.register.types[info.css];
              } else {
                yml[key].css = info.css;
              }
            } else {
              yml[key].css.component['built/styles/' + entry.sass.head + '/' + name + '.min.css'] = config.register.types[config.register.defaultType.css];
            }
          }
          if (entry.js) {
            yml[key].js = {};
            if (info.js !== undefined) {
              if (typeof info.js === 'string') {
                yml[key].js['built/scripts/' + entry.js.head + '/' + name + '.min.js'] = config.register.types[info.js];
              } else {
                yml[key].js = entry.info.library.js;
              }
            } else {
              yml[key].js['built/scripts/' + entry.js.head + '/' + name + '.min.js'] = config.register.types[config.register.defaultType.js];
            }
          }
          for (const prop in info) {
            if (prop === 'name') continue;
            yml[key][prop] = yml[key][prop] || info[prop];
          }
        }
        FS.writeFile(target, Yaml.dump(yml), function() {
          cb();
        });
      });
    });

    Gulp.task('register:watch', Gulp.series('register', function registerWatch() {
      Gulp.watch([...config.register.watch.change, manager.path(config.vendor, 'vendor.yml')], Gulp.parallel('register'))
        .on('change', RegisterTask.onChange);

      Gulp.watch(config.register.watch.link, { events: ['add', 'unlink'], delay: 1000 }, Gulp.parallel('register'))
        .on('change', RegisterTask.onChange);
    }));
  }

  static onChange(path) {
    console.log('Trigger "register" by changing "' + Path.basename(path) + '"');
  }

};

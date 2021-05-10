const Task = require('gloom-plugin/Task');
const Gulp = require('gulp');
const Glob = require('glob');
const Path = require('path');
const Yaml = require('js-yaml');
const FS = require('fs');
const Chalk = require('chalk');
const Similarity = require('string-similarity');

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
        validate: {
          type: 'object',
          properties: {
            library: {
              type: ['object', 'boolean'],
              properties: {
                name: {
                  type: 'string',
                },
                js: {
                  type: ['object', 'string'],
                },
                css: {
                  type: ['object', 'string'],
                  properties: {
                    base: {
                      type: 'object',
                    },
                    layout: {
                      type: 'object',
                    },
                    component: {
                      type: 'object',
                    },
                    state: {
                      type: 'object',
                    },
                    theme: {
                      type: 'object',
                    },
                  },
                  additionalProperties: false,
                },
                dependencies: {
                  type: 'array',
                },
              },
              additionalProperties: false,
            },
            additionalProperties: false,
          },
        },
        src: 'src/comps/**/*.+(sass|js|yml)',
        srcIgnore: 'src/comps/**/_*.+(sass|js|yml)',
        watch: {
          change: 'src/**/*.yml',
          link: 'src/**/*.+(sass|js|yml)',
        },
        dest: 'dist',
        headRegex: 'src\/([^\/]*)',
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
      const validate = require('jsonschema').validate;

      const theme = Path.basename(manager.path());
      const target = manager.path(theme + '.libraries.yml');
      const LibsPlugin = manager.getPlugin('libs');

      Glob(manager.path(config.register.src), {
        ignore: manager.path(config.register.srcIgnore),
      }, function(error, files) {
        const data = {};

        for (const file of files) {
          const parse = Path.parse(file);
          const name = parse.name;

          parse.file = file;
          data[name] = data[name] || {};
          data[name].name = name;
          data[name][parse.ext.substring(1)] = parse;
          if (parse.ext.substring(1) === 'yml') {
            data[name].info = Yaml.load(FS.readFileSync(file).toString());
            try {
              RegisterTask.logValidateErrors(data[name], validate(data[name].info, config.register.validate), config);
            } catch (e) {
              console.log(Chalk.red('-'.repeat(process.stdout.columns)));
              console.log(Chalk.red('[BETA ERROR]: Please inform the developer about the error. This error don\'t abort the compile process.'));
              console.log(e);
              console.log(Chalk.red('-'.repeat(process.stdout.columns)));
            }
          }
        }

        const yml = {};
        if (LibsPlugin) {
          const libs = LibsPlugin.getLibsData();
          for (const item in libs) {
            const entry = libs[item];
  
            if (entry.css) {
              for (const type in entry.css) {
                for (const file in entry.css[type]) {
                  if (typeof entry.css[type][file] === 'string') {
                    entry.css[type][file] = config.register.types[entry.css[type][file]];
                  }
  
                  if (!file.startsWith('http') && !file.startsWith('/')) {
                    const newName = config.register.dest + '/styles/libs/' + Path.basename(file);
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
                  const newName = config.register.dest + '/scripts/libs/' + Path.basename(file);
                  entry.js[newName] = entry.js[file];
                  delete entry.js[file];
                }
              }
            }
  
            yml[item] = entry;
          }
        }

        for (const name in data) {
          const entry = data[name];
          if (entry && entry.info && entry.info.library === false) continue;
          const info = entry.info && entry.info.library || {};
          const key = info.name || name;

          yml[key] = {};
          if (entry.sass) {
            yml[key].css = { component: {} };
            if (info.css !== undefined) {
              if (typeof info.css === 'string') {
                yml[key].css.component[config.register.dest + '/styles/' + name + '.min.css'] = config.register.types[info.css];
              } else {
                yml[key].css = info.css;
              }
            } else {
              yml[key].css.component[config.register.dest + '/styles/' + name + '.min.css'] = config.register.types[config.register.defaultType.css];
            }
          }
          if (entry.js) {
            yml[key].js = {};
            if (info.js !== undefined) {
              if (typeof info.js === 'string') {
                yml[key].js[config.register.dest + '/scripts/' + name + '.min.js'] = config.register.types[info.js];
              } else {
                yml[key].js = entry.info.library.js;
              }
            } else {
              yml[key].js[config.register.dest + '/scripts/' + name + '.min.js'] = config.register.types[config.register.defaultType.js];
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
      const LibsPlugin = manager.getPlugin('libs');

      if (LibsPlugin && LibsPlugin.getLibsPath()) {
        Gulp.watch([...config.register.watch.change, LibsPlugin.getLibsPath()], Gulp.parallel('register'))
          .on('change', RegisterTask.onChange);
      } else {
        Gulp.watch(config.register.watch.change, Gulp.parallel('register'))
          .on('change', RegisterTask.onChange);
      }
       

      Gulp.watch(config.register.watch.link, { events: ['add', 'unlink'], delay: 1000 }, Gulp.parallel('register'))
        .on('change', RegisterTask.onChange);
    }));
  }

  static onChange(path) {
    console.log('Trigger "register" by changing "' + Path.basename(path) + '"');
  }

  static logValidateErrors(data, result, config) {
    if (result.errors) {
      for (const error of result.errors) {
        console.log(Chalk.yellow('[WARNING]: (' + data.yml.base + ') ' + Chalk.cyan('"' + error.path.join('.') + '"') + ' ' + error.message));
        if (typeof error.argument === 'string') {
          const guess = Similarity.findBestMatch(error.argument, RegisterTask.getSchemaOptions(config.register.validate, error.path)).bestMatch.target;
          console.log(Chalk.cyan('[NOTE]: Do you mean "' + guess + '"?'));
        }
      }
    }
  }

  static getSchemaOptions(schema, path) {
    for (const prop of path) {
      schema = schema.properties[prop];
    }
    const options = [];

    for (const field in schema.properties) {
      options.push(field);
    }
    return options;
  }

};

const Path = require('path');

module.exports = {
  tasks: 'tasks',
  schema: 'schema',
  load: function(manager) {
    console.log('module load');
    manager.loadDir(Path.join(__dirname, 'tasks'));
  },
};
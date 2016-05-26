var globby = require('globby')
  , exec = require('child_process').execSync;

var blacklist = {
  extention: [
  'json',
  ],

  directory: [
    'node_modules',
  ],

  string: function() {

  }
};

function readFiles(files) {
  var code = {};

  files.forEach(function(path) {
    var lines = exec('cat ' + path + ' | wc -l', { encoding: 'utf8' })
      , parts = path.split('.')
      , ext   = parts[parts.length - 1];

    code[ext] = code[ext] || 0;
    code[ext] += parseInt(lines);
  });

  return code;
};

console.log('arguments', process.argv);

globby(['**/*'], { nodir: true, ignore: ['node_modules/**'] }).then(function(files) {
  console.dir(readFiles(files));
});

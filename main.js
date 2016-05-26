;(function() {
  var exec = require('child_process').execSync
    , globby = require('globby');

  var BLACKLIST = ['node_modules'];

  var options = {
    // glob options
    get: function() {
      return {
        nodir: true,
        ignore: this.parse(process.argv.slice(2, process.argv.length)),
      };
    },

    // parse process args
    parse: function(args) {
      var blacklist = BLACKLIST;

      if (args.length) {
        args.map(function(arg) {
          var parts = arg.split('=')
            , param = parts[0]
            , value = parts[1];

          if (param === '-ignore' || param === '-i' || param === '-exclude') {
            blacklist.push(this.trim(value));
          }
        }.bind(this));
      }

      blacklist.map(function(item, index) {
        this[index] += '/**';
      }.bind(blacklist));

      return blacklist;
    },

    trim: function(value) {
      if (value.slice(-1) === '/') {
        value = value.substring(0, value.length - 1);
      }

      return value;
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

  globby(['**/*'], options.get()).then(function(files) {
    console.dir(readFiles(files));
  });
})();

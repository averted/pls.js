var exec = require('child_process').execSync
  , glob = require('globby')
  , langs = require('./langs')
  , colors = require('./colors')
  , sprintf = require('sprintf-js').sprintf;

var BLACKLIST = ['node_modules'];

var pls = {
  /**
   * Find line count and lang stats in current dir.
   *
   * @param files - array of file paths
   */
  parse: function(files) {
    var code = {}
      , results = {};

    files.forEach(function(path) {
      var lines = exec('cat ' + path + ' | wc -l', { encoding: 'utf8' })
        , parts = path.split('.')
        , ext   = parts[parts.length - 1];

      code[ext] = code[ext] || 0;
      code[ext] += parseInt(lines);
    });

    Object.keys(code).map(function(ext) {
      langs.map(function(lang) {
        if (lang.exts.indexOf(ext) >= 0) {
          results[lang.name] = results[lang.name] || 0;
          results[lang.name] += code[ext];
        }
      });
    });

    return results;
  },

  /**
   * Print out formatted lang stats.
   *
   * @param code - { lang: line_count } key value pairs
   */
  print: function(code) {
    var total = 0;

    console.log('\n+------------------- PLS --------------------+');

    Object.keys(code).map(function(lang) {
      total += code[lang];
    });

    Object.keys(code).map(function(lang) {
      var percent = Math.round(code[lang] / total * 100) + '%';

      console.log(sprintf('|%s %-4s %-22s %+8s %s %s|', colors.yellow, percent, lang, code[lang], 'lines', colors.end));
    });

    console.log('+--------------------------------------------+');
    console.log(sprintf('|%s %-20s %+15s %s %s|', colors.green, 'Total:', total, 'lines', colors.end));
    console.log('+--------------------------------------------+\n');
  },

  init: function() {
    glob(['**/*'], this.options.defaults()).then(function(files) {
      this.print(this.parse(files));
    }.bind(this));
  },

  options: {
    defaults: function() {
      return {
        nodir: true,
        ignore: this.parse(process.argv.slice(2, process.argv.length)),
      };
    },

    // parse args
    parse: function(args) {
      var blacklist = BLACKLIST;

      if (args.length) {
        args.map(function(arg) {
          var parts = arg.split('=')
            , param = parts[0]
            , value = parts[1];

          if (param === '-ignore' || param === '-i' || param === '-exclude') {
            blacklist.push(this.strip(value));
          }
        }.bind(this));
      }

      blacklist.map(function(item, index) {
        this[index] += '/**';
      }.bind(blacklist));

      return blacklist;
    },

    // strip last char
    strip: function(value) {
      if (value.slice(-1) === '/') {
        value = value.substring(0, value.length - 1);
      }

      return value;
    }
  },
};

module.exports = pls;

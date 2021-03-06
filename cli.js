#!/usr/bin/env node

var v8 = require('v8');
var fs = require('fs');
var path = require('path');
var wrap = require('module').wrap;
var spawnSync = require('child_process').spawnSync;

var bytenode = require('./index.js');

var args = process.argv.slice(2);

if (args.includes('-c')) {
  args[args.indexOf('-c')] = '--compile';
}
if (args.includes('-o')) {
  args[args.indexOf('-o')] = '--out';
}

if (args.includes('-h')) {
  args[args.indexOf('-h')] = '--help';
}

if (args.includes('-v')) {
  args[args.indexOf('-v')] = '--version';
}

var program = {
  dirname: __dirname,
  filename: __filename,
  nodeBin: process.argv[0],
  flags: args.filter(function(arg) { return arg[0] === '-'}),
  files: args.filter(function(arg) { return arg[0] !== '-' && arg[1] !== '-'}),
};

if (program.flags.includes('--compile')) {

  program.files.forEach(function (filename) {

    filename = path.resolve(filename);

    if (fs.existsSync(filename) && fs.statSync(filename).isFile()) {

      var compileAsModule = !program.flags.includes('--no-module');

      try {
        bytenode.compileFile({ filename, compileAsModule });
      } catch (error) {
        console.error(error);
      }
    } else {
      console.error('Error: Cannot find file ' + filename);
    }
  });

  if (program.files.length === 0) {

    var script = '';

    process.stdin.setEncoding('utf-8');

    process.stdin.on('readable', function() {
      var data = process.stdin.read();
      if (data !== null) {
        script += data;
      }
    });

    process.stdin.on('end', function() {

      try {
        process.stdout.write(bytenode.compileCode(wrap(script)));
      } catch (error) {
        console.error(error);
      }
    });
  }
}

else if (program.flags.includes('--help')) {

  console.log("");
}

else if (program.flags.includes('--version') && program.flags.length === 1 && program.files.length === 0) {

  var package = require('./package.json');
  console.log(package.name, package.version);
}

else {

  try {
    spawnSync(program.nodeBin, [
      '-r',
      path.resolve(__dirname, 'index.js')
    ].concat(args), {
        stdio: 'inherit'
      });
  } catch (error) {
    console.error(error);
  }
}
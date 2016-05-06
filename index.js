var fs      = require('fs');
var tmp     = require('tmp');
var getPort = require('get-port');
var randomstring = require("randomstring");
var invokeElevatedCmd   = require('@mh-cbon/aghfabsowecwn/lib/invoke_elevated_cmd.js')

// yes, it s a singleton

var address = null;
var fileToQuit = null;
var tokenToQuit = randomstring.generate();
var pendings = [];

process.on('exit', function () {
  if (fileToQuit) {
    fs.writeFileSync(fileToQuit, tokenToQuit)
  }
})

tmp.tmpName(function _tempNameGenerated(err, path) {
    if (err) throw err;
    fileToQuit = path;

    getPort().then(port => {
      address = {
        hostname: '127.0.0.1',
        port: port,
        port: port
      }
      var serverOptions = {
        maxTimeoutLen:  1000 * 60 * 3,
        autoClose:      false,
        fileToQuit:     fileToQuit,
        tokenToQuit:    tokenToQuit
      }
      invokeElevatedCmd(address, serverOptions);
      pendings.splice(0, pendings.length).forEach(function(fn){
        fn();
      })
    }).catch(function (err) {
      console.log(err);
    });
});

var onceReady = function (fn) {
  if(!address || !fileToQuit) pendings.push(fn)
  else fn();
}

// end of the singleton

var Rcp                 = require('@mh-cbon/remote-child_process');
var FakeChild           = Rcp.FakeChild;
var RcpClient           = Rcp.RcpClient;

var executeRemoteChildProcess = function (runOpts, options) {
  if(!options) options = {};
  if(!options.cwd) options.cwd = process.cwd();
  var child = new FakeChild(options.stdio);
  var client = new RcpClient();

  var maxTimeoutLen = options.bridgeTimeout || 1000 * 60 * 3;

  onceReady(function () {
    var mustFinish = false;
    var maxTimeout = setTimeout(function () {
      mustFinish = true;
    }, maxTimeoutLen);

    var openAndConnectChild = function () {
      client.open(address, function (err) {
        if (err) {
          if (!mustFinish && err.code && err.code==='ECONNREFUSED') {
            return setTimeout(openAndConnectChild, 100);
          }
          clearTimeout(maxTimeout);
          child.emit('error', err);
          return child.emit('close', -2) //unsure which code is correct
        }
        clearTimeout(maxTimeout);
        delete options.bridgeTimeout;
        client.runRemote(child, runOpts, options)
      })
    }
    openAndConnectChild();
  })

  return child;
}
var spawn = function (bin, args, options) {
  var runOpts = {
    mode: 'spawn',
    bin:  bin,
    args: args
  }
  return executeRemoteChildProcess(runOpts, options);
}

var exec = function (cmd, options, done) {
  var runOpts = {
    mode: 'exec',
    cmd:  cmd
  }
  return executeRemoteChildProcess(runOpts, options);
}

module.exports = {
  spawn:  spawn,
  exec:   exec
};

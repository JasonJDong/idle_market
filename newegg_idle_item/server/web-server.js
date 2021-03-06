var express = require('express');
var fs = require('fs');
var mimemap = require('./mimemap')
var agent = require('agentkeepalive');
var path = require('path');
var url = require('url');
var request = require('request');
var async = require('async');
var uuid = require('uuid');
var config = require('./config');
var crypto = require('crypto');
var moduleType = require('./sqliteutil').moduleType;
var sqliteClass = require('./sqliteutil').Sqlite;

var sqlite = new sqliteClass();
sqlite.open();

var util = require('util')
var utils = require('./util')

var app = express();
var DEFAULT_PORT = config.listenPort || 9000;


var keepaliveAgent = new agent({
    maxSockets: 2048,
    maxKeepAliveRequests: 0, // max requests per keepalive socket, default is 0, no limit.
    maxKeepAliveTime: 30000 // keepalive for 30 seconds
});
require('http').globalAgent = keepaliveAgent;

app.configure(function () {
    if (config.expressloglevel == 'dev') app.use(express.logger(config.expressloglevel));
    app.use(express.bodyParser());
    app.use(express.errorHandler({
        dumpExceptions: true,
        showStack: true
    }));
});

app.get('/syncServer', function (req, res) {
  res.send(config.syncServer);
  res.end();
});

app.get('/', function (req, res) {
    res.setHeader('Content-Type','text/html');
    var redirectHome = '/home.html';
    var home = path.join(__dirname, redirectHome);
    res.writeHead(301, {
      'Content-Type': 'text/html',
      'Location': redirectHome
    });
    res.write('<!doctype html>\n');
    res.write('<title>301 Moved Permanently</title>\n');
    res.write('<h1>Moved Permanently</h1>');
    res.write(
      '<p>The document has moved <a href="' +
      redirectHome +
      '">here</a>.</p>'
    );
    res.end();
});

app.post('/fileupload', function (req, res) {
  try{
    var count = req.files.files.length;
    res.setHeader('Content-Type', 'application/json');
    req.files.files.forEach(function (file) {
      generateRandomFilePath(file.name, file.path, function (pathData) {
        var resData = {
          success: true,
          pictureUrl: pathData.relativePath
        }
        if (!pathData.exists) {
          fs.createReadStream(file.path).pipe(fs.createWriteStream(pathData.absolutePath));
        }
        res.write(JSON.stringify(resData));
        if (--count <= 0) res.end();
      });
    });
  }
  catch(e){
    res.send({success: false})
    res.end()
  }
});

app.get('/buyitem/:skip/:count', function (req, res) {
  sqlite.getItems(req.params.count, req.params.skip, moduleType.buy, function (results) {
    res.send(results);
    res.end();
  });
});

app.post('/buyitem', function (req, res) {
  var data = req.body;
  data.password = data.password || uuid.v4();
  var action = data.guid ? 'update' : 'add';
  sqlite.buyItem(data.user, data.content, data.tags, data.password, data.pictureUrl, data.guid, function (err, cbData) {
    if (err) {
      res.send(500);
      res.end();
    }else{
      cbData.changes = cbData.changes || 0;
      cbData.updated = cbData.changes != 0;
      if (cbData.updated) {
        delete data.password;
        notifyChanges(data, action + '_buy_item')
      };
      res.send(cbData);
      res.end()
    }
  });
});

app.delete('/buyitem/:guidpwd', function (req, res) {
  deleteItem(req, res, moduleType.buy);
});

function deleteItem(req, res, moduleType) {
  try{
    var guidpwd = new Buffer(req.params.guidpwd, 'base64').toString('utf8').split(':');
    var password = guidpwd.pop();
    var guid = guidpwd.pop();
    sqlite.deleteitem(guid, password, moduleType, function (err, cbData) {
      if (err) {
        res.send(500);
        res.end();
      }else{
        cbData.changes = cbData.changes || 0;
        cbData.deleted = cbData.changes != 0;
        if (cbData.deleted) {
          notifyChanges(guid, 'del_' + moduleType.toLowerCase() + '_item')
        };
        res.send(cbData);
        res.end()
      }
    });
  }
  catch(e){
    res.send(405);
    res.end();
  }
}

app.get('/sellitem/:skip/:count', function (req, res) {
  sqlite.getItems(req.params.count, req.params.skip, moduleType.sell, function (results) {
    res.send(results);
    res.end();
  });
});

app.post('/sellitem', function (req, res) {
  var data = req.body;
  data.password = data.password || uuid.v4();
  var action = data.guid ? 'update' : 'add';
  sqlite.sellItem(data.user, data.content, data.tags, data.password, data.pictureUrl ,data.guid, function (err, cbData) {
    if (err) {
      res.send(500);
      res.end();
    }else{
      cbData.changes = cbData.changes || 0;
      cbData.updated = cbData.changes != 0;
      if (cbData.updated) {
        delete data.password;
        notifyChanges(data, action + '_sell_item')
      };
      res.send(cbData);
      res.end()
    }
  });
});

app.delete('/sellitem/:guidpwd', function (req, res) {
  deleteItem(req, res, moduleType.sell);
});

app.post('/login', function (req, res) {
  var data = req.body;
  sqlite.userAccess(data.user, data.password, function (err, results) {
    if (results) {
      async.parallel({
        sell: function (callback) {
          sqlite.getMyItem(data.user, moduleType.sell, function (sellItems) {
            sellItems = sellItems || new Array();
            callback(sellItems);
          });
        },
        buy: function (callback) {
          sqlite.getMyItem(data.user, moduleType.buy, function (buyItems) {
            buyItems = buyItems || new Array();
            callback(buyItems);
          });
        }
        },function (asyncErr, items) {
        res.send(items);
        res.end();
      })
    }else{
      res.send(401);
      res.end();
    }
  });
});

app.post('/signup', function (req, res) {
  var data = req.body;
  sqlite.resgisterUser(data.user, data.password, data.displayName, function (results) {
    var code = !results ? 200: 400;
    res.send(code);
    res.end();
  });
});

app.get('/search', function (req, res) {
  try{
    var parsedUrl = url.parse(req.url, true);
    var term = parsedUrl.query.q;
    var buyOrSell = parseInt(parsedUrl.query.qt);
    if (!term) {
      throw new Exception();
    }
    var module = buyOrSell == 0 ? moduleType.buy: moduleType.sell;
    sqlite.seachItems(term, module, function (results) {
       results = results || new Array();
       res.send(results);
    });
  }
  catch(e){
    res.send(404);
    res.end();
  }
})

app.get('/*', function (req, res) {
    var parsedUrl = parseUrl(req.url);
    var pathParse = path.join(config.home, parsedUrl.pathname).replace('//', '/').replace(/%(..)/g, function(match, hex) {
      return String.fromCharCode(parseInt(hex, 16));
    });
    var contentType = getContentTypeFromPath(pathParse);
    res.setHeader('Content-Type',contentType);
    var type = contentType.split('/').shift();
    var isNeedCache = false;
    if (type) {
      isNeedCache = type == 'image' || contentType == 'application/x-javascript' || contentType == 'text/css'
    };
    getFile(pathParse, res, isNeedCache);
});

app.head('/*', function (req, res) {
   res.end();
});

var getContentTypeFromPath = function (path) {
  var contentType = 'application/x-msdownload';
  if (path) {
    var extension = "." + path.split('.').pop();
    contentType = mimemap.findMIME(extension.toLowerCase());
  }
  return contentType;
}

var getFile = function (fPath, res, setCache) {
  if (setCache) {
    setResponseCache(res);
  };
  try{
    fs.exists(fPath, function (exists) {
      if (!exists) {
        fPath = path.join(config.home, 'views/error/404.html');
        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Cache-Control', 'no-cache');
      }
      res.sendfile(fPath);
    })
  }catch(e){
    res.send(404);
    res.end();
  }
}

var getDecodePath = function (encodePath) {
  var encodeParams = encodePath.split('/');
  var decodeParams = new Array();
  for (var i = 0; i < encodeParams.length; i++) {
    decodeParams.push(decodeURIComponent(encodeParams[i]));
  }
  return decodeParams.join('/');
}

var getEncodePath = function (path) {
  var pathParams = path.split('/');
  var encodeParams = new Array();
  for (var i = 0; i < pathParams.length; i++) {
    encodeParams.push(encodeURIComponent(pathParams[i]));
  }
  return encodeParams.join('/');
}

var getExtension = function (path) {
  var pathParams = path.split('.');
  return '.' + pathParams.pop();
}

var setResponseCache = function (res) {
    res.setHeader('Cache-Control', "max-age=" + 3600);
    var date = new Date();
    date.setDate(date.getHours() + 1);
    res.setHeader('Expires', date.toGMTString());
}

var parseUrl = function(urlString) {
  var parsed = url.parse(urlString);
  parsed.pathname = url.resolve('/', parsed.pathname);
  return url.parse(url.format(parsed), true);
};

var s2b = function (str) {
  return new Buffer(str, 'utf8').toString('base64');
}

var b2s = function (base64) {
  return new Buffer(base64, 'base64').toString('utf8');
}

var serverInternalError = function (res) {
  res.send(500);
  res.end();
}

var severCanotResolve = function (res) {
  res.send(400);
  res.end();
}

var generateRandomFilePath = function (originalName, expressTempFile, callback) {
  var readStream = fs.createReadStream(expressTempFile)
  var data = null;
  var pathData = null;
  readStream.on('data', function (chunk) {
    if(chunk) data+=chunk;
  });

  readStream.on('end', function () {
    var guid = utils.cryptoBuffer(data);
    pathData = {
      absolutePath: path.join(config.home, 'public', 'upload', guid + getExtension(originalName)),
      relativePath: path.join('public', 'upload', guid + getExtension(originalName)),
      exists: false
    };
    fs.exists(pathData.absolutePath, function (exists) {
      if (exists) {
        pathData.exists = true;
      }
    });
  })

  readStream.on('close', function () {
    callback(pathData)
  });
}

var notifyChanges = function (data, changeType) {
  var option = {
      url: url.resolve(config.syncServer, '/notify'),
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({data: data, changeType: changeType})
    }
  request(option, function (err, res, body) {
  });
}

exports.start = function () {
    app.listen(DEFAULT_PORT);
    util.puts('Http Server running at [this PC IP]:' + DEFAULT_PORT + '/');
}


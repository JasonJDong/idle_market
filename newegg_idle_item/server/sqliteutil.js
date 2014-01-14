var sqlite = require('sqlite3').verbose();
var fs = require('fs');
var util = require('./util');
var path = require('path');
var config = require('./config');
var async = require('async');
var urlutil = require('url');
var crypto = require('crypto');
var uuid = require('uuid');

var createSql = path.join(__dirname, 'createtable.sql');

var dbName = 'neweggitem.db';

exports.moduleType = {
    buy: "toBuy",
    sell: "toSell"
}

var SQLITE = function () {
    this.init = function () {
        installDB(function (success) {
            util.info("sqlite database installed", success ? "success." : "failed.");
        });
    };

    this.open = function () {
        openDB();
    }

    this.close = function () {
        closeDb();
    }

    this.userAccess = function (user, password, callback) {
        if (SQLITE.prototype.dbclient != null) {
            password = util.cryptoString(password);
            SQLITE.prototype.dbclient.get("SELECT 1 FROM userMeta WHERE user = ? AND password = ?", [user, password], function (err, result) {
                if (!result) {
                    callback(err, result);
                } else {
                    callback(err, null);
                }
            });
        }
    };

    this.resgisterUser = function (user, password, displayName, callback) {
        if (SQLITE.prototype.dbclient != null) {
            password = util.cryptoString(password);
            SQLITE.prototype.dbclient.run("INSERT INTO userMeta(user, password, displayName) VALUES(?, ?, ?)", [user, password, displayName], function (err) {
                callback(err);
            });
        }
    };

    this.buyItem = function (user, content, tags, password, picUrl, guid, callback) {
        if (SQLITE.prototype.dbclient != null) {
            var params = new Array();
            password = util.cryptoString(password)
            if (!guid) params.push(uuid.v4());
            params.push(user);
            params.push(content);
            params.push(new Date().valueOf());
            if (!guid) params.push(password);
            params.push(picUrl);
            tags.forEach(function (tag) {
                params.push(tag);
            });

            if (guid && password) {
                params.push(guid);
                params.push(password)
            }

            var sqlStr = !guid? 
                    "INSERT INTO toBuy(id, guid, user, content, datetime, password, pictureUrl, tag1, tag2, tag3, tag4, tag5) VALUES(NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
                    :
                    "UPDATE toBuy SET user=?, content=?, datetime=?, pictureUrl=?, tag1=?, tag2=?, tag3=?, tag4=?, tag5=? WHERE guid=? and password=?";
            SQLITE.prototype.dbclient.run(sqlStr, params, function (err) {
                var cbData = {
                    lastId: this.lastId,
                    changes: this.changes,
                }
                if (!guid) {
                    cbData.guid = params[0];
                }
                callback(err, cbData);
            });
        }
    };

    this.sellItem = function (user, content, tags, password, picUrl, guid, callback) {
        if (SQLITE.prototype.dbclient != null) {
            var params = new Array();
            password = util.cryptoString(password)
            if (!guid) params.push(uuid.v4());
            params.push(user)
            params.push(content);
            params.push(new Date().valueOf());
            if(!guid) params.push(password);
            params.push(picUrl);
            tags.forEach(function (tag) {
                params.push(tag);
            });

            if (guid && password) {
                params.push(guid);
                params.push(password);
            }

            var sqlStr = !guid? 
                    "INSERT INTO toSell(id, guid, user, content, datetime, password, pictureUrl, tag1, tag2, tag3, tag4, tag5) VALUES(NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
                    :
                    "UPDATE toSell SET user=?, content=?, datetime=?, pictureUrl=?, tag1=?, tag2=?, tag3=?, tag4=?, tag5=? WHERE guid=? and password=?";
            SQLITE.prototype.dbclient.run(sqlStr, params, function (err) {
                var cbData = {
                    lastId: this.lastId,
                    changes: this.changes,
                }
                if (!guid) {
                    cbData.guid = params[0];
                }
                callback(err, cbData);
            });
        }else{
            callback({}, -1, 0);
        }
    };

    this.deleteitem = function (guid, password, type, callback) {
        if (guid) {
            if (SQLITE.prototype.dbclient != null) {
                password = util.cryptoString(password)
                var sqlStr = "DELETE FROM " + type + " WHERE guid=? AND password=?";
                SQLITE.prototype.dbclient.run(sqlStr, [guid, password], function (err) {
                    var cbData = {
                        lastId: this.lastId,
                        changes: this.changes,
                    }
                    callback(err, cbData);
                });
            }else{
                callback({}, -1, 0);
            }
        }else{
            callback({}, -1, 0);
        }
    };

    this.seachItems = function (term, type, callback) {
        if (SQLITE.prototype.dbclient != null) {
            var sqlStr = "SELECT id, guid, user, content, datetime, tag1, tag2, tag3, tag4, tag5 FROM " + type+ 
                        " WHERE user LIKE '%" + term + "%' OR content LIKE '%" + term + "%' OR tag1 LIKE '%" + term + "%' OR " +
                        "tag2 LIKE '%" + term + "%' OR tag3 LIKE '%" + term + "%' OR tag4 LIKE '%" + term + "%' OR tag5 LIKE '%" + term + "%' LIMIT 100 ORDER BY id DESC";
            SQLITE.prototype.dbclient.all(sqlStr, function (err, rows) {
                callback(rows);
            });
        }
    }

    this.getMyItem = function (user, type, callback) {
        if (SQLITE.prototype.dbclient != null) {
            var sqlStr = "SELECT id, guid, user, content, datetime, tag1, tag2, tag3, tag4, tag5 FROM " + type + 
                        " WHERE user = ?";
            SQLITE.prototype.dbclient.all(sqlStr, [user], function (err, rows) {
                callback(rows);
            });
        }
    }

    this.getItems = function (count, page, type, callback) {
        if (SQLITE.prototype.dbclient != null) {
            var sqlStr = "SELECT id, guid, user, content, datetime, pictureUrl, tag1, tag2, tag3, tag4, tag5 FROM " + type + 
                        " LIMIT " + count + " OFFSET " + (page * count);
            SQLITE.prototype.dbclient.all(sqlStr, function (err, rows) {
                callback(rows);
            });
        }
    }

    this.getItemByGuid = function (guid, type,callback) {
        if (SQLITE.prototype.dbclient != null) {
            var sqlStr = "SELECT id, guid, user, content, datetime, pictureUrl, tag1, tag2, tag3, tag4, tag5 FROM " + type + 
                        " WHERE guid = ?";
            SQLITE.prototype.dbclient.all(sqlStr, [guid],function (err, rows) {
                callback(rows);
            });
        }
    }
};

function installDB(callback) {
    try {
        if (SQLITE.prototype.dbclient == null) {
            SQLITE.prototype.dbclient = new sqlite.Database(dbName)
        }
        fs.readFile(createSql, "utf8", function (err, data) {
            if (!err) {
                SQLITE.prototype.dbclient.exec(data, function (createerr) {
                    if (!createerr) {
                        closeDb();
                        console.log(1)
                        callback(true);
                    }else{
                        util.error(createerr);
                    }
                });
            }else{
                callback(false);
            }
        });
    } catch (e) {
        util.error(e);
        callback(false);
    }
}

function openDB () {
    SQLITE.prototype.dbclient = new sqlite.Database(dbName);
}

function closeDb() {
    SQLITE.prototype.dbclient.close();
}

exports.Sqlite = SQLITE;


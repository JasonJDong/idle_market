var sqlite = require('sqlite3').verbose();
var fs = require('fs');
var util = require('./util');
var path = require('path');
var config = require('./config');
var async = require('async');
var urlutil = require('url');
var crypto = require('crypto');

var createSql = path.join(__dirname, 'createtable.sql');

var dbName = 'neweggitem.db';

exports.moduleType = {
    buy: "toBuy",
    sell: "toSell"
}

var SQLITE = function () {
    this.load = function () {
        opendb(function (success) {
            util.info("sqlite database installed", success ? "success." : "failed.");
        });
    };

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

    this.buyItem = function (user, content, tags, id, callback) {
        if (SQLITE.prototype.dbclient != null) {
            var params = new Array();
            params.push(user);
            params.push(content);
            params.push(new Date().valueOf());
            tags.forEach(function (tag) {
                params.push(tag);
            });

            if (!id) {
                params.push(id);
            }

            var sqlStr = !id? 
                    "INSERT INTO toBuy(user, content, datetime, tag1, tag2, tag3, tag4, tag5) VALUES(?, ?, ?, ?, ?, ?, ?, ?)"
                    :
                    "UPDATE toBuy SET user=?, content=?, datetime=?, tag1=?, tag2=?, tag3=?, tag4=?, tag5=? WHERE id=?";
            SQLITE.prototype.dbclient.run(sqlStr, params, function (err) {
                callback(err);
            });
        }
    };

    this.sellItem = function (user, content, tags, isNew, callback) {
        if (SQLITE.prototype.dbclient != null) {
            var params = new Array();
            params.push(user)
            params.push(content);
            params.push(new Date().valueOf());
            tags.forEach(function (tag) {
                params.push(tag);
            });

            if (!id) {
                params.push(id);
            }

            var sqlStr = !id? 
                    "INSERT INTO toSell(user, content, datetime, tag1, tag2, tag3, tag4, tag5) VALUES(?, ?, ?, ?, ?, ?, ?, ?)"
                    :
                    "UPDATE toSell SET user=?, content=?, datetime=?, tag1=?, tag2=?, tag3=?, tag4=?, tag5=? WHERE id=?";
            SQLITE.prototype.dbclient.run(sqlStr, params, function (err) {
                callback(err);
            });
        }
    };

    this.seachItems = function (term, buyOrSell, callback) {
        if (SQLITE.prototype.dbclient != null) {
            var sqlStr = "SELECT id, user, content, datetime, tag1, tag2, tag3, tag4, tag5 FROM " + buyOrSell+ 
                        " WHERE user LIKE '%" + term + "%' OR content LIKE '%" + term + "%' OR tag1 LIKE '%" + term + "%' OR " +
                        "tag2 LIKE '%" + term + "%' OR tag3 LIKE '%" + term + "%' OR tag4 LIKE '%" + term + "%' OR tag5 LIKE '%" + term + "%' LIMIT 100 ORDER BY id DESC";
            SQLITE.prototype.dbclient.all(sqlStr, function (err, rows) {
                callback(rows);
            });
        }
    }

    this.getMyItem = function (user, buyOrSell, callback) {
        if (SQLITE.prototype.dbclient != null) {
            var sqlStr = "SELECT id, user, content, datetime, tag1, tag2, tag3, tag4, tag5 FROM " + buyOrSell + 
                        " WHERE user = ?";
            SQLITE.prototype.dbclient.all(sqlStr, [user], function (err, rows) {
                callback(rows);
            });
        }
    }

    this.getItems = function (count, page, buyOrSell, callback) {
        if (SQLITE.prototype.dbclient != null) {
            var sqlStr = "SELECT id, user, content, datetime, tag1, tag2, tag3, tag4, tag5 FROM " + buyOrSell + 
                        " LIMIT " + count + " OFFSET " + (page * count);
            SQLITE.prototype.dbclient.all(sqlStr, function (err, rows) {
                callback(rows);
            });
        }
    }
};

function opendb(callback) {
    try {
        if (SQLITE.prototype.dbclient == null) {
            SQLITE.prototype.dbclient = new sqlite.Database(dbName);
            fs.readFile(createSql, "utf8", function (err, data) {
                if (!err) {
                    SQLITE.prototype.dbclient.exec(data, function (createerr) {
                        if (!createerr) {
                            callback(true);
                        }
                    });
                }
            });
        } else {
            callback(true);
        }
    } catch (e) {
        util.error(e);
        callback(false);
    }
}

function closeDb() {
    SQLITE.prototype.dbclient.close();
}

exports.Sqlite = SQLITE;


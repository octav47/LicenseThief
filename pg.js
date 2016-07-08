'use strict';

var $ = require('./conf/app.js');

var pg = require('pg');

var client = new pg.Client($.database);

client.on('drain', client.end.bind(client));
client.connect();

for (var k = 0; k < 11; k++) {
    var json = require('./license/' + (k + 1) + '.json');

    for (var i in json) {
        if (json.hasOwnProperty(i)) {
            (function (o, i, k) {
                var sqlQuery = 'SELECT license_local_id FROM license_local WHERE license_id = ' + o.id;
                client.query(sqlQuery, function (err, result) {
                    if (err) {
                        console.error(err);
                        console.log(sqlQuery);
                    }

                    console.log(result.rows.length);
                    if (result.rows.length === 0) {
                        var id;
                        client.query('SELECT nextval(\'license_ids\')', function (err, result) {
                            id = result.rows[0].nextval;

                            for (var j in o) {
                                if (o.hasOwnProperty(j) && j !== 'id' && j !== 'geomObj' && o[j] !== '') {
                                    o[j] = o[j].replace(/('|")/gmi, '');
                                }
                            }

                            var sqlQuery = 'INSERT INTO license_local VALUES(' + o.id + ', ' + id + ')';

                            client.query(sqlQuery, function (err, result) {
                                if (err) {
                                    throw err;
                                }

                                var sqlQuery = 'INSERT INTO licenses VALUES(' + id + ', ' +
                                    '\'' + o.startDate + '\', ' +
                                    '\'' + o.regNumberSerial + '\', ' +
                                    '\'' + o.regNumber + '\', ' +
                                    '\'' + o.regNumberType + '\', ' +
                                    '\'' + o.owner + '\', ' +
                                    '\'' + o.purpose + '\', ' +
                                    '\'' + o.stateLicense + '\', ' +
                                    '\'' + o.place + '\', ' +
                                    '\'' + o.status + '\', ' +
                                    '\'' + o.stateOffice + '\', ' +
                                    '\'' + o.stateGov + '\', ' +
                                    '\'' + o.endDate + '\', ' +
                                    o.id + ')';

                                client.query(sqlQuery, function (err, result) {
                                    if (err) {
                                        console.error(err);
                                        console.log(sqlQuery);
                                    }
                                    //client.end();
                                });
                            });
                        });
                    } else if (result.rows.length === 1) {
                        var sqlQuery = 'INSERT INTO licenses VALUES(' + id + ', ' +
                            '\'' + o.startDate + '\', ' +
                            '\'' + o.regNumberSerial + '\', ' +
                            '\'' + o.regNumber + '\', ' +
                            '\'' + o.regNumberType + '\', ' +
                            '\'' + o.owner + '\', ' +
                            '\'' + o.purpose + '\', ' +
                            '\'' + o.stateLicense + '\', ' +
                            '\'' + o.place + '\', ' +
                            '\'' + o.status + '\', ' +
                            '\'' + o.stateOffice + '\', ' +
                            '\'' + o.stateGov + '\', ' +
                            '\'' + o.endDate + '\', ' +
                            o.id + ')';

                        client.query(sqlQuery, function (err, result) {
                            if (err) {
                                console.error(err);
                                console.log(sqlQuery);
                            }
                            //client.end();
                        });
                    } else {
                        throw 'find more then 1 rows in license_local_id; expected 1';
                    }
                });
            })(json[i], i, k);
        }
    }
}

//var id;
//client.query('SELECT nextval(\'license_ids\')', function (err, result) {
//    id = result.rows[0].nextval;
//
//    var query = client.query('INSERT INTO licenses VALUES(' + id + ', \'2016-07-01\', 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, \'2016-07-01\')', function(err, result) {
//        if (err) {
//            throw err;
//        }
//        client.end();
//    });
//});
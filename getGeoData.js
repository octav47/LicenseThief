'use strict';

var $ = require('./conf/app.js');
var gsl = require('./js/getSingleLicense.js');
var fs = require('fs');
var queryString = require('querystring');
var http = require('http');
var logger = require('log4js');
logger.configure($.setting.logs);
logger = logger.getLogger();

var i = 0;

function dfs(i) {
    var count = 0;

    if (i == 11) {
        logger.fatal('All geo data is downloaded');
        return;
    }
    var json = require('./license/' + (i + 1) + '.json');

    var requestsCount = Object.keys(json).length;

    for (var k in json) {
        if (json.hasOwnProperty(k)) {
            (function (k, i, count, json) {
                setTimeout(function () {
                    var data = queryString.stringify({
                        id: k
                    });
                    var req = http.request({
                        host: 'www.rfgf.ru',
                        port: 80,
                        path: '/license/coordsrv.php?id=' + k,
                        method: 'POST'
                    }, function (res) {
                        var w = '';
                        res.on('data', function (chunk) {
                            w += chunk;
                        });
                        res.on('end', function () {
                            var geo;
                            try {
                                geo = JSON.parse(w);
                            } catch (e) {
                                logger.error('REQ' + count + ', ID: ' + k + ' produced an error. Nothing to save');
                                geo = [];
                            }
                            if (geo.length === 0) {
                                logger.debug('REQ' + count + ', ID: ' + k + ' is empty. Next...');
                                json[k].geomObj = [];
                            } else if (geo.length > 1) {
                                logger.error('geo length > 1, ID: ' + k);
                            } else {
                                delete geo[0]['GRAPH_TYPE'];
                                delete geo[0]['Weight'];
                                delete geo[0]['body'];
                                delete geo[0]['color'];
                                delete geo[0]['count_unnamed'];
                                delete geo[0]['description'];
                                delete geo[0]['fillcolor'];
                                delete geo[0]['header'];
                                geo = geo[0];

                                json[k].geomObj = geo;
                                logger.info('REQ' + count + ', ID: ' + k + ' is saved. Next...');
                            }
                            // fs.writeFile($.output.geoData + 'json/' + (i + 1) + '.json', JSON.stringify(json), 'utf-8');
                            geo = null;

                            requestsCount--;
                            if (requestsCount < 1) {
                                fs.writeFile($.output.geoData + 'json/' + (i + 1) + '.json', JSON.stringify(json, null, 4), 'utf-8');
                                logger.warn('DONE: ' + (i + 1) + '.json');
                                dfs(i + 1);
                            }
                        })
                    });
                    req.write(data);
                    req.end();
                }, count * 25);
            })(k, i, count, json);
            count++;
        }
    }
}

dfs(i);
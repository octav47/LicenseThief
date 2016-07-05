'use strict';

var $ = require('./conf/app.js');
var gsl = require('./js/getSingleLicense.js');
var fs = require('fs');
var queryString = require('querystring');
var http = require('http');
var logger = require('log4js').getLogger();

var fullData = {};

var fullGeoData = {};

for (var i = 0; i < 11; i++) {
    var json = require('./license/' + (i + 1) + '.json');

    for (var j in json) {
        if (json.hasOwnProperty(j)) {
            fullData[j] = json[j];
        }
    }
}

var count = 0;
for (var k in fullData) {
    if (fullData.hasOwnProperty(k)) {
        (function (i, count) {
            setTimeout(function () {
                var data = queryString.stringify({
                    id: i
                });
                var req = http.request({
                    host: 'www.rfgf.ru',
                    port: 80,
                    path: '/license/coordsrv.php?id=' + i,
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
                            logger.error('REQ' + count + ', ID: ' + i + ' produced an error. Nothing to save');
                            geo = [];
                        }
                        if (geo.length === 0) {
                            // logger.warn('REQ' + count + ', ID: ' + i + ' is empty. Next...');
                            fullGeoData[i] = {
                                geo: []
                            };
                        } else if (geo.length > 1) {
                            logger.error('geo length > 1, ID: ' + i);
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

                            fullGeoData[i] = {
                                geo: geo
                            };
                            logger.info('REQ' + count + ', ID: ' + i + ' is saved. Next...');
                        }
                        fs.writeFile($.output.geoData + i + '.json', JSON.stringify(geo), 'utf-8');
                    })
                });
                req.write(data);
                req.end();
            }, count * 25);
        })(k, count);
        count++;
    }
}
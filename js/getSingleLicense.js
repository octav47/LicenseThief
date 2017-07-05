'use strict';

var $ = require('../conf/app.js');

var formatDate = require('./utils/date.js').formatDate;

var fs = require('fs');
var queryString = require('querystring');
var http = require('http');
var syncRequest = require('sync-request');
var iconv = require('iconv-lite');
var logger = require('log4js').getLogger();

var $chunk = $.setting.chunk;

/**
 * @param {string} w
 * @returns {object}
 */
function parseChunk(w) {
    var result = [],
        result2 = [];
    var noGeomObjIds = [];
    var noGeomObj = [];

    w = w
        .replace(/<div class='totalpage'>.*?<\/div>/gmi, '')
        .replace(/<form class = 'page'>.*?<\/form><div>/gmi, '');
    var regexSplit = /<tr.*?>(\n|.)*?<\/tr>/gmi;
    var tmp = w.match(regexSplit);

    for (var j = 0; j < tmp.length; j++) {
        if (tmp[j].indexOf('<tr class=\'head\'>') == -1) {
            tmp[j] = tmp[j]
                .replace(/<tr.*?<td>/gmi, '')
                .replace(/<\/td><\/tr>/gmi, '');
            var id = +tmp[j].match(/<a href='.*?\?iid=(\d*).*?' target='_blank'>/)[1];
            if (noGeomObjIds.indexOf(id) == -1) {
                tmp[j] = tmp[j]
                    .replace(/<a href='.*?' target='_blank'>/gmi, '')
                    .replace(/<\/a>/gmi, '')
                    // .replace(/nbsp/gmi, '')
                    .replace(/[&nbsp;]/gmi, '');
                var tmpArray = tmp[j].split('</td><td>');

                var geo;
                if ($.setting.geo) {
                    geo = JSON.parse(syncRequest('POST', 'https://www.rfgf.ru/license/coordsrv.php?id=' + id).getBody('utf-8'));
                } else {
                    geo = [];
                }

                //var geo = JSON.parse($.ajax({
                //    url: 'https://www.rfgf.ru/license/coordsrv.php?id=' + id,
                //    async: false,
                //    type: 'POST',
                //    data: {
                //        id: id
                //    }
                //}).responseText);

                //console.log(geo);

                if (geo.length > 1) {
                    logger.error('Geo with length > 1 is found! License ID: ' + id);
                } else if (geo.length == 1) {
                    delete geo[0]['GRAPH_TYPE'];
                    delete geo[0]['Weight'];
                    delete geo[0]['body'];
                    delete geo[0]['color'];
                    delete geo[0]['count_unnamed'];
                    delete geo[0]['description'];
                    delete geo[0]['fillcolor'];
                    delete geo[0]['header'];
                    geo = geo[0];
                } else {
                    geo = undefined;
                }

                // delete geo['GRAPH_TYPE'];
                // delete geo['Weight'];
                // delete geo['body'];
                // delete geo['color'];
                // delete geo['count_unnamed'];
                // delete geo['description'];
                // delete geo['fillcolor'];
                // delete geo['header'];

                tmpArray[5] = tmpArray[5].replace(/\s\d{6}.*/gmi, '');
                if (geo === undefined) {
                    noGeomObj.push({
                        id: +id,
                        startDate: formatDate(tmpArray[1]),
                        regNumberSerial: tmpArray[2],
                        regNumber: tmpArray[3],
                        regNumberType: tmpArray[4],
                        owner: tmpArray[5],
                        purpose: tmpArray[6],
                        stateLicense: tmpArray[7],
                        place: tmpArray[8],
                        status: tmpArray[9],
                        stateOffice: tmpArray[10],
                        stateGov: tmpArray[11],
                        endDate: formatDate(tmpArray[12]),
                        geomObj: geo
                    })
                } else if (tmpArray[1].length > 10 || tmpArray[12].length > 10) {
                    result2.push({
                        id: +id,
                        startDate: formatDate(tmpArray[1]),
                        regNumberSerial: tmpArray[2],
                        regNumber: tmpArray[3],
                        regNumberType: tmpArray[4],
                        owner: tmpArray[5],
                        purpose: tmpArray[6],
                        stateLicense: tmpArray[7],
                        place: tmpArray[8],
                        status: tmpArray[9],
                        stateOffice: tmpArray[10],
                        stateGov: tmpArray[11],
                        endDate: formatDate(tmpArray[12]),
                        geomObj: geo
                    })
                } else {
                    result.push({
                        id: +id,
                        startDate: formatDate(tmpArray[1]),
                        regNumberSerial: tmpArray[2],
                        regNumber: tmpArray[3],
                        regNumberType: tmpArray[4],
                        owner: tmpArray[5],
                        purpose: tmpArray[6],
                        stateLicense: tmpArray[7],
                        place: tmpArray[8],
                        status: tmpArray[9],
                        stateOffice: tmpArray[10],
                        stateGov: tmpArray[11],
                        endDate: formatDate(tmpArray[12]),
                        geomObj: geo
                    })
                }
            }
        }
    }

    return {
        success: result,
        problem: result2,
        noGeoObj: noGeomObj
    }
}

/**
 *
 * @param settings
 */
function getSingleLicense(settings) {
    var httpListener = settings.httpListener;

    var vidpi = settings.data.vidpi;

    var page = settings.data.page;

    var data = queryString.stringify({
        ftext: '',
        lnum: '',
        'pigroup[]': [-1],
        'vidpi[]': vidpi,
        //'geo[]': [3607],
        dtactual: '',
        dtactual1: '',
        dtnl: '',
        dtnl1: '',
        owner: '',
        dodl: '',
        dodl1: '',
        goals: '',
        status: '',
        full: 1,
        gg: '',
        mode: 'extctl',
        place: '',
        page: page
    });

    var options = {
        host: 'www.rfgf.ru',
        port: 80,
        path: '/license/',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(data)
        }
    };

    setTimeout(function () {
        var req = http.request(options, function(res) {
            var responseString = '';
            res.on('data', function (chunk) {
                //var iconv = new Iconv('windows-1251', 'utf-8');
                //var buffer = iconv.convert(chunk);
                responseString += iconv.decode(chunk, 'windows-1251');
                //responseString += chunk;
            });
            res.on('end', function (e) {
                httpListener.inc();

                var r = parseChunk(responseString);

                var fileName;
                if ($chunk && r.success + [] !== '') {
                    fileName = $.output.success + 'response-' + page + '.json';
                    fs.writeFileSync(fileName, JSON.stringify(r.success, null, 4), 'utf-8');
                    logger.info('File ' + fileName + ' is written');
                }
                if ($chunk && r.problem + [] !== '') {
                    fileName = $.output.problem + 'response-' + page + '.json';
                    fs.writeFileSync(fileName, JSON.stringify(r.problem, null, 4), 'utf-8');
                    logger.info('File ' + fileName + ' is written');
                }
                if ($chunk && r.noGeoObj + [] !== '') {
                    fileName = $.output.noGeoObj + 'response-' + page + '.json';
                    fs.writeFileSync(fileName, JSON.stringify(r.noGeoObj, null, 4), 'utf-8');
                    logger.info('File ' + fileName + ' is written');
                }

                var f1 = appendFullData(r.success);
                var f2 = appendFullData(r.problem);
                //var f1 = false, f2 = false;
                var f3 = appendFullData(r.noGeoObj);

                if (!f1 && !f2) {
                    logger.info('Saving ' + vidpi[0] + '.json');
                    var totalFileName = $.output.specifiedTotal(vidpi[0]);
                    fs.writeFileSync(totalFileName, JSON.stringify($.fullData, null, 4), 'utf-8');
                    $.fullData = {};
                    httpListener.fulfill();
                    return;
                } else {
                    logger.warn('f1', f1)
                    logger.warn('f2', f2)
                    logger.warn('f3', f3)
                }

                logger.debug('Page ' + settings.data.page + ' is ended, next...');
                settings.data.page++;
                getSingleLicense(settings);
            });
            res.on('error', function (e) {
                logger.error(e.message);
            })
        });

        req.write(data);
        req.end();
    }, 150);
}

/**
 * Сохраняет данные по лицензии в $.fullData
 * @param {Array} r
 * @returns {boolean}
 */
function appendFullData(r) {
    if (r.length === 0) {
        return false;
    }
    for (var i = 0; i < r.length; i++) {
        var element = r[i];
        if ($.fullData[element.id]) {
            //console.dir(element);
            logger.debug('License ID:' + element.id + ' is already exists. Skipping...');
            return false;
        } else {
            $.fullData[element.id] = element;
        }
    }
    return true;
}

/**
 *
 * @type {getSingleLicense}
 */
module.exports.getSingleLicense = getSingleLicense;
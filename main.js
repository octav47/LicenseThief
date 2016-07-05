var $ = require('./conf/app.js');

var gsl = require('./js/getSingleLicense.js');

var fs = require('fs');
var logger = require('log4js').getLogger();

logger.setLevel('DEBUG');

var vidpi = $.license.vidpi.map(function (e) {
    return e.id;
});

var pagesCount = 1500;
var currentVidpi = 1;

function HttpListener(requestsCount, onFulfilled) {
    this.count = 0;
    this.maxCount = requestsCount || Number.MAX_VALUE;
    this.onFulfilled = onFulfilled || function () {};
}

HttpListener.prototype.inc = function () {
    this.count++;
    if (this.count >= this.maxCount) {
        this.onFulfilled();
    }
};

HttpListener.prototype.fulfill = function () {
    this.onFulfilled();
};

var httpListener = new HttpListener(pagesCount, function () {
    fs.writeFileSync($.output.total, JSON.stringify($.fullData, null, 4), 'utf-8');
});

function dfs() {
    if (currentVidpi > 11) {
        logger.info('OK!');
        return true;
    }
    gsl.getSingleLicense({
        data: {
            vidpi: [currentVidpi],
            page: 1
        },
        httpListener: new HttpListener(null, function () {
            currentVidpi++;
            dfs();
        })
    });
}

dfs();
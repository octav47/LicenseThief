var $ = require('./conf/app.js');

var gsl = require('./js/getSingleLicense.js');
var ggd = require('./getGeoData.js');

var fs = require('fs');
var logger = require('log4js');
logger.configure($.setting.logs);
logger = logger.getLogger();

//logger.setLevel('INFO');

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

function Listener(target, callback) {
    var self = this;
    this.target = target;
    this.callback = callback || function () {};
    this.listen = function () {
        if (this.target()) {
            this.callback();
        } else {
            setTimeout(function () {
                self.listen();
            }, 1000);
        }
    }
}

function dfs() {
    if (currentVidpi > 11) {
        logger.info('OK!');
        logger.info('All data is downloaded. Start downloading geo data');
        ggd.getGeoData(0);
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

dfs(0);
var $ = require('./conf/app.js');

var logger = require('log4js');
logger.setGlobalLogLevel('ERROR');

var main = require('./main.js');

var vorpal = require('vorpal')();

vorpal
    .command('update [options]', 'Updates licenses')
    .action(function (args, callback) {
        var options = args.options || '';
        if (typeof options == 'object' && Object.keys(options).length === 0) {
            options = '';
        }
        if (options.indexOf('d') > -1) {
            logger.setGlobalLogLevel('TRACE');
        }
        this.log('update started');
        main.update(0);
        callback();
    });

vorpal
    .command('conf', 'View configuration')
    .action(function (args, callback) {
        var settings = $.setting;
        this.log('------------');
        logConfProperty(this, 'log path', settings.logs);
        logConfProperty(this, 'is geo', settings.geo);
        logConfProperty(this, 'save chuck data', settings.chunk);

        var output = $.output;
        logConfProperty(this, 'path', output.path);
        logConfProperty(this, 'total.json path', output.total);
        logConfProperty(this, 'success chunk path', output.success);
        logConfProperty(this, 'problem chunk path', output.problem);
        logConfProperty(this, 'no geom obj chunk path', output.noGeoObj);
        logConfProperty(this, 'geo data path', output.geoData);

        callback();
    });

vorpal
    .delimiter('lthief$')
    .show();

function logConfProperty(cmd, description, variable) {
    cmd.log(description + ':\t' + variable);
    cmd.log('------------');
}
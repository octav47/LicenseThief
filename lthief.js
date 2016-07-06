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
    .delimiter('lthief$')
    .show();
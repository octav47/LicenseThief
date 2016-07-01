var $ = require('./conf/app.js');

var gsl = require('./js/getSingleLicense.js');

var vidpi = $.license.vidpi.map(function (e) {
    return e.id;
});

for (var i = 1; i < 10; i++) {
    gsl.getSingleLicense({
        data: {
            vidpi: [],
            page: i
        }
    })
}
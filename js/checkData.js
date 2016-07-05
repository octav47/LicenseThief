var fullDataLength = 70146; // взять с сайта https://www.rfgf.ru/license/

var dataLengths = [];

var fullData = {};

for (var i = 0; i < 11; i++) {
    var json = require('../license/' + (i + 1) + '.json');

    for (var j in json) {
        if (json.hasOwnProperty(j)) {
            fullData[j] = json[j];
        }
    }

    var jsonLength = Object.keys(json).length;
    dataLengths.push(jsonLength);
}

var currentFullDataLength = dataLengths.reduce(function (prev, current) {
    return prev + current;
});

var isOk = currentFullDataLength === fullDataLength;

console.log(isOk);

if (!isOk) {
    console.log('currentFullDataLength = ' + currentFullDataLength);
    console.log('fullDataLength = ' + fullDataLength);
    console.log('fullData keys length = ' + Object.keys(fullData).length);
}
var map;

function init() {
    map = new ymaps.Map("map", {
        center: [55.73, 37.75],
        zoom: 4
    }, {
        searchControlProvider: 'yandex#search'
    });
}

ymaps.ready(init);

$(document).ready(function () {
    function createButton(options) {
        return '<button data-id="' + options.id + '" type="button" class="btn btn-default">' + options.name + '</button>';
    }

    var loading = $('#loading');

    var licenseButtons = $('#license-buttons');

    var previewTable = $('#preview-table');

    var currentData = {};

    var vidpi = module.exports.license.vidpi;

    var vidpiMap = module.exports.license.vidpiMap;

    for (var i in vidpiMap) {
        if (vidpiMap.hasOwnProperty(i)) {
            licenseButtons.append(createButton({
                id: i,
                name: vidpiMap[i].name
            }));
        }
    }

    licenseButtons.find('> button').on('click', function () {
        map.setCenter([55.73, 37.75]);
        map.setZoom(4);
        map.geoObjects.removeAll();

        licenseButtons.find('> button')
            .addClass('btn-default')
            .removeClass('btn-success');
        $(this)
            .addClass('btn-success')
            .removeClass('btn-default');
        $.ajax({
            url: '../license/' + $(this).data('id') + '.json',
            beforeSend: function () {
                var tbody = previewTable.find('tbody').empty();
                loading.css('display', '');
            },
            success: function (data) {
                currentData = {};

                var keys = Object.keys(data);
                keys = keys.slice(0, 20);

                var tbody = previewTable.find('tbody');
                var w = '';
                for (var i = 0; i < keys.length; i++) {
                    var d = data[keys[i]];
                    currentData[d.id] = d;
                    w += '<tr data-id="' + d.id + '">' +
                        '<td>' + d.id + '</td>' +
                        '<td>' + d.startDate + '</td>' +
                        '<td>' + d.regNumberSerial + '</td>' +
                        '<td>' + d.regNumber + '</td>' +
                        '<td>' + d.regNumberType + '</td>' +
                        '<td>' + d.owner + '</td>' +
                        '<td>' + d.purpose + '</td>' +
                        '<td>' + d.stateLicense + '</td>' +
                        '<td>' + d.place + '</td>' +
                        '<td>' + d.status + '</td>' +
                        '<td>' + d.stateOffice + '</td>' +
                        '<td>' + d.stateGov + '</td>' +
                        '<td>' + d.endDate + '</td>' +
                        '<td>' + d.id + '</td>' +
                        '</tr>';
                }
                tbody
                    .empty()
                    .append(w);
            },
            complete: function () {
                loading.css('display', 'none');

                previewTable.find('tr').on('click', function () {
                    map.geoObjects.removeAll();

                    previewTable.find('tr')
                        .removeClass('success');
                    $(this).addClass('success');

                    var d = currentData[+$(this).data('id')];
                    if (d.geomObj) {
                        var coordinates = d.geomObj['1'];

                        var myGeoObject = new ymaps.GeoObject({
                            geometry: {
                                type: "Polygon",
                                coordinates: [
                                    coordinates
                                ],
                                fillRule: "nonZero"
                            },
                            properties:{
                                balloonContent: "Многоугольник"
                            }
                        }, {
                            fillColor: '#00FF00',
                            strokeColor: '#0000FF',
                            opacity: 0.5,
                            strokeWidth: 5,
                            strokeStyle: 'shortdash'
                        });

                        map.setCenter(coordinates[0]);
                        map.setZoom(10);
                        map.geoObjects.add(myGeoObject);
                    }
                })
            }
        })
    })
});
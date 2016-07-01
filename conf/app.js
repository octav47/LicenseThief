var conf = {
    license: {
        vidpi: [
            {
                id: 6,
                name: 'Углеводородное сырье (Н)'
            },
            {
                id: 1,
                name: 'Благородные металлы (Б)'
            },
            {
                id: 4,
                name: 'Драгоценные камни и кристаллы (К)'
            },
            {
                id: 11,
                name: 'Радиоактивные металлы (Р)'
            },
            {
                id: 9,
                name: 'Твердые полезные ископаемые (включая уголь) (Т)'
            },
            {
                id: 10,
                name: 'Уголь (У)'
            }
        ]
    },
    output: {
        path: 'output/',
        total: 'output/total.json',
        success: 'output/success/',
        problem: 'output/problem/',
        noGeoObj: 'output/noGeoObj/'
    },
    request: {
        timeout: 100
    },
    fullData: {}
};

module.exports = conf;
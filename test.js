// let main = require('./main.js')
//
// main.update(0)

let fs = require('fs')
let fetch = require('isomorphic-fetch')

let queryString = require('querystring')
let http = require('http')
let data = require('./output/geoData/json/9.json')

function sleep(ms) {
    ms += new Date().getTime();
    while (new Date() < ms) {
    }
}

let openedRequests = 0
let endedRequests = 0

// for (let i = 1; i < 12; i++) {
//     let jsonFile = require(`./output/geoData/json/${i}.json`)
//
//     console.log(`##### start ${i}.json`)
//
//     for (let key in jsonFile) {
//         if (jsonFile.hasOwnProperty(key) && !Array.isArray(jsonFile[key].geomObj)) {
//             openedRequests++
//             fetch('http://localhost:8080/gistek/license/make/', {
//                 method: 'post',
//                 headers: {
//                     'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify(jsonFile[key])
//             })
//                 .then(r => r.text())
//                 .then((r) => {
//                     console.log(r)
//                     endedRequests++
//                 })
//                 .catch((e) => {
//                     console.log(e)
//                 })
//
//             sleep(1)
//             console.log(`openedRequests: ${openedRequests}, endedRequests: ${endedRequests}`)
//         }
//     }
// }

function post(entity) {
    let options = {
        agent: false,
        host: 'localhost',
        port: 8080,
        path: '/gistek/license/make/',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
            // 'Content-Length': Buffer.byteLength(postData)
        }
    }

    let req = http.request(options, (res) => {
        res.setEncoding('utf8')

        // console.log(res)

        let rawData = ''
        res.on('data', (chunk) => {
            rawData += chunk
            console.log(`entity: ${entity.id}: ${chunk}`);
        })

        res.on('end', () => {
            let w = ''
            if (rawData.indexOf('org.postgresql.util.PSQLException') > -1 ||
                rawData.indexOf('geometry requires more points') > -1) {
                w = `entity: ${entity.id}: geometry error`
            } else {
                `entity: ${entity.id}: ${rawData}`
            }
            console.log(w)
            finished++
        })


    }).on('error', (e) => {
        console.error(`Got error: ${e.message}`);
    })

    req.write(JSON.stringify(entity))
    req.end()
}

// let total = {}
//
// for (let i = 1; i < 12; i++) {
//     let jsonFile = require(`./output/geoData/json/${i}.json`)
//     for (let key in jsonFile) {
//         if (jsonFile.hasOwnProperty(key) && !Array.isArray(jsonFile[key].geomObj)) {
//             total[key] = jsonFile[key]
//         }
//     }
// }
//
// fs.writeFileSync('./total.json', JSON.stringify(total))

// console.log(`total entities = ${Object.keys(total).length}`)
//

// let total = require('./total.json')

// let start = 0
// let finished = 0
// let end = 500
//
// // console.log(JSON.stringify(total[2648542], null, 4))
//
// for (let key in total) {
//     if (start < end && total.hasOwnProperty(key)) {
//         start++
//
//         post(total[key])
//
//         sleep(1)
//         console.log(`start: ${start}, finished: ${finished}, end: ${end}`)
//     }
// }

let json = require('./output/geoData/json/6.json')
console.log(Object.keys(json).length)
// let json = require('./total.json')

let lengthBeforeCleanUp = Object.keys(json).length

for (let key in json) {
    if (json.hasOwnProperty(key)) {
        let entity = json[key]
        if (Array.isArray(entity.geomObj) && entity.geomObj.length === 0) {
            delete json[key]
        }
    }
}

let lengthAfterCleanUp = Object.keys(json).length

console.log(`deleted ${lengthBeforeCleanUp - lengthAfterCleanUp} entities`)

fetch('http://localhost:8080/gistek/license/makeAll/', {
    method: 'post',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(json)
})
    .then(r => {
        console.log(r)
        return r.text()
    })
    .then((r) => {
        console.log(`${r}`)
    })
    .catch((...args) => {
        console.log(args)
    })

// let entity = {
//     "id": 77777777,
//     "startDate": "2000-08-31",
//     "regNumberSerial": "НЖГ",
//     "regNumber": "00486",
//     "regNumberType": "ТП",
//     "owner": "ГГП Волжское ГГП \"Волгагеология\"",
//     "purpose": "поисково-оценочные работы на магнезиальные известняки",
//     "stateLicense": "Адм.Первомайского р-на, 961, 20.07.1999",
//     "place": "Худошинское проявление, Нижегородская область, Первомайский р-н,сев.-вост. с.Худошино",
//     "status": "геологический",
//     "stateOffice": "Нижегородгеолком Богатырев О.С.",
//     "stateGov": "Администрация Нижегородской области Соколов Н.Г.",
//     "endDate": "2003-03-01",
//     "geomObj": {
//         "1": [
//             [
//                 55.116244177667,
//                 43.641294932946
//             ],
//             [
//                 55.116244911291,
//                 43.685740263253
//             ],
//             [
//                 55.089300039285,
//                 43.685741615633
//             ],
//             [
//                 55.089299328804,
//                 43.642685174655
//             ],
//             [
//                 55.100132822208,
//                 43.641295714417
//             ],
//             [
//                 55.116244177667,
//                 43.641294932946
//             ],
//             [
//                 55.116244177667,
//                 43.641294932946
//             ]
//         ]
//     }
// }

// let entity = {
//     "id": 77777777,
//     "startDate": "2000-08-31",
//     "regNumberSerial": "НЖГ",
//     "regNumber": "00486",
//     "regNumberType": "ТП",
//     "owner": "ГГП Волжское ГГП \"Волгагеология\"",
//     "purpose": "поисково-оценочные работы на магнезиальные известняки",
//     "stateLicense": "Адм.Первомайского р-на, 961, 20.07.1999",
//     "place": "Худошинское проявление, Нижегородская область, Первомайский р-н,сев.-вост. с.Худошино",
//     "status": "геологический",
//     "stateOffice": "Нижегородгеолком Богатырев О.С.",
//     "stateGov": "Администрация Нижегородской области Соколов Н.Г.",
//     "endDate": "2003-03-01",
//     "geomObj": {
//         "1": [
//             [
//                 55.116244177667,
//                 43.641294932946
//             ],
//             [
//                 55.116244911291,
//                 43.685740263253
//             ]
//         ]
//     }
// }

// let entity = {
//     "id": 77777777,
//     "startDate": "2000-08-31",
//     "regNumberSerial": "НЖГ",
//     "regNumber": "00486",
//     "regNumberType": "ТП",
//     "owner": "ГГП Волжское ГГП \"Волгагеология\"",
//     "purpose": "поисково-оценочные работы на магнезиальные известняки",
//     "stateLicense": "Адм.Первомайского р-на, 961, 20.07.1999",
//     "place": "Худошинское проявление, Нижегородская область, Первомайский р-н,сев.-вост. с.Худошино",
//     "status": "геологический",
//     "stateOffice": "Нижегородгеолком Богатырев О.С.",
//     "stateGov": "Администрация Нижегородской области Соколов Н.Г.",
//     "endDate": "2003-03-01",
//     "geomObj": {
//         "1": [
//             [
//                 55.116244177667,
//                 43.641294932946
//             ],
//             [
//                 55.116244911291,
//                 43.685740263253
//             ],
//             [
//                 55.089300039285,
//                 43.685741615633
//             ],
//             [
//                 55.089299328804,
//                 43.642685174655
//             ],
//             [
//                 55.100132822208,
//                 43.641295714417
//             ]
//         ]
//     }
// }
//
// fetch('http://192.168.245.45/license/make/', {
//     method: 'post',
//     headers: {
//         'Content-Type': 'application/json'
//     },
//     body: JSON.stringify(entity)
// })
//     .then(r => {
//         // console.log(r)
//         return r.json()
//     })
//     .then((r) => {
//         console.log(`result is ${r}`)
//     })
//     .catch((...args) => {
//         console.log(args)
//     })
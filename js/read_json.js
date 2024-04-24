var subsidence_data
// 台北市停車場資訊
var parkData = {"type": "FeatureCollection", "features": []};
// 台北市剩餘停車位資訊
var remainData;

// 讀取台北市停車場資訊json
fetch('data/TCMSV_alldesc.json')
.then((response) => response.json())
.then((data) => {
    console.log(data['data']['park']);
    for (let i = 0; i < data['data']['park'].length; i++) {
        parkData['features'].push(
            {
                "type": "Feature", 
                "properties": {
                    "id": data['data']['park'][i]['id'], 
                    "area": data['data']['park'][i]['area'], 
                    "name": data['data']['park'][i]['name'], 
                    "payex": data['data']['park'][i]['payex'], 
                    "address": data['data']['park'][i]['address'], 
                    "summary": data['data']['park'][i]['summary'], 
                    "totalcar": data['data']['park'][i]['totalcar'], 
                    "totalmotor": data['data']['park'][i]['totalmotor'], 
                    "FareInfo": data['data']['park'][i]['FareInfo'], 
                    "EntranceCoord": data['data']['park'][i]['EntranceCoord']
                }, 
                "geometry": {
                    "type": "Point", 
                    "coordinates": proj4(EPSG3826, EPSG4326, [
                        Number(data['data']['park'][i]['tw97x']), 
                        Number(data['data']['park'][i]['tw97y'])
                    ])
                }
            }
        )
    }
});

// 讀取台北市剩餘停車位api
fetch('https://www.ttcx.dot.gov.taipei/cpt/api/ParkingRemainingData?$format=json&$token=iXE5sPCXMfpjgcucMrWcQd6FbJlAJqQsrAAqCHGSCg8')
.then((response) => response.json())
.then((data) => {
    console.log('台北市剩餘停車位');
    console.log(data);
    remainData = data;
});

// 由id取得停車場剩餘停車位資訊
function getAvaCarById(id, data) {
    return data.filter(
        function (data) {
            return data.id == id;
        }
    );
}
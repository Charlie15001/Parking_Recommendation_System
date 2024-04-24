mapboxgl.accessToken = 'pk.eyJ1IjoiY2hhcmxpZTE1MDAxIiwiYSI6ImNsOGhkcTR0aTBuOWUzdm1sdnJzcHlhNXQifQ.PVfQyFvlGtac88V1Pl929w';
// const points = [];
var feature_layerId = 'points';
// 儲存使用者所在經緯度
var startXY;
// 儲存目的地經緯度
var destinationName;
var destinationText;
var destinationXY;

const map = new mapboxgl.Map({
    container: 'map', // container ID
    // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
    style: 'mapbox://styles/mapbox/streets-v12', // style URL
    center: [121.53972165526163, 25.01786932097694], // starting position [lng, lat]
    zoom: 11, // starting zoom
    projection: 'globe', // display the map as a 3D globe
    pitch: 45, 
    // bearing: -17.6, 
    antialias: true
});

const navigation = new mapboxgl.NavigationControl();

// 取得使用者所在位置
const geolocate = new mapboxgl.GeolocateControl({
    positionOptions: {
        enableHighAccuracy: true
    },
    // When active the map will receive updates to the device's location as it changes.
    trackUserLocation: true,
    // Draw an arrow next to the location dot to indicate which direction the device is heading.
    showUserHeading: true
});

const geocoder = new MapboxGeocoder({
    // Initialize the geocoder
    accessToken: mapboxgl.accessToken, // Set the access token
    mapboxgl: mapboxgl, // Set the mapbox-gl instance
    marker: false // Do not use the default marker style
});

const options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
};

function success(pos) {
    const crd = pos.coords;

    console.log('Your current position is:');
    console.log(`Latitude : ${crd.latitude}`);
    console.log(`Longitude: ${crd.longitude}`);
    console.log(`More or less ${crd.accuracy} meters.`);
    startXY = [crd.longitude, crd.latitude]; // 提供路徑規劃API取用使用者坐標資訊
}

function error(err) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
}

// 打開頁面即取得使用者坐標資訊
window.onload = function getLocation() {
    if (navigator.geolocation) {
        // navigator.geolocation.getCurrentPosition(showPosition);
        navigator.geolocation.getCurrentPosition(success, error, options);
    }
}

async function getRoute(end) {
    const query = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${startXY[0]},${startXY[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`,
        { method: 'GET' }
    );
    const json = await query.json();
    const data = json.routes[0];
    const route = data.geometry.coordinates;
    const geojson = {
        type: 'Feature',
        properties: {},
        geometry: {
            type: 'LineString',
            coordinates: route
        }
    };
    if (map.getSource('route')) {
        map.getSource('route').setData(geojson);
    }
    else {
    map.addLayer({
        id: 'route',
        type: 'line',
        source: {
            type: 'geojson',
            data: geojson
        },
        layout: {
            'line-join': 'round',
            'line-cap': 'round'
        },
        paint: {
            'line-color': '#3887be',
            'line-width': 5,
            'line-opacity': 0.75
        }
    });
    }
    const instructions = document.getElementById('instructions');
    const steps = data.legs[0].steps;

    let tripInstructions = '';
    for (const step of steps) {
      tripInstructions += `<li>${step.maneuver.instruction}</li>`;
    }
    instructions.innerHTML = `<p><strong>行車時間: ${Math.floor(data.duration / 60)} 分鐘 </strong></p><ol>${tripInstructions}</ol>`;
}

function showBuildings() {
    if (document.getElementById('btn-check-outlined').checked) {
        map.setLayoutProperty('add-3d-buildings', 'visibility', 'visible');
    } else {
        map.setLayoutProperty('add-3d-buildings', 'visibility', 'none');
    }
}

function showAllParkinglots() {
    if (document.getElementById('parking-check-outlined').checked) {
        map.setLayoutProperty('parking-layer', 'visibility', 'visible');
        map.setLayoutProperty('searchResult-layer', 'visibility', 'none');
    } else {
        map.setLayoutProperty('parking-layer', 'visibility', 'none');
        map.setLayoutProperty('searchResult-layer', 'visibility', 'visible');
    }
}

map.on('load', () => {
    map.loadImage(
        'img/location.png',
        (error, image) => {
        if (error) throw error;
        map.addImage('end-marker', image);
        }
    );
    getRoute(startXY);
    map.on('click', (event) => {
        const coords = Object.keys(event.lngLat).map((key) => event.lngLat[key]);
        const end = {
            type: 'FeatureCollection',
            features: [
                {
                    type: 'Feature',
                    properties: {},
                    geometry: {
                        type: 'Point',
                        coordinates: coords
                    }
                }
            ]
        };
        if (map.getLayer('end')) {
            map.getSource('end').setData(end);
        } else {
            map.addLayer({
                id: 'end',
                type: 'symbol',
                source: {
                    type: 'geojson',
                    data: {
                        type: 'FeatureCollection',
                        features: [
                            {
                                type: 'Feature',
                                properties: {},
                                geometry: {
                                    type: 'Point',
                                    coordinates: coords
                                }
                            }
                        ]
                    }
                },
                // paint: {
                //     'circle-radius': 10,
                //     'circle-color': '#f30'
                // }
                layout: {
                    'icon-image': 'end-marker', 
                    'icon-size': 0.1, 
                    'text-field': '您選擇的停車場', 
                    'text-font': [
                        'Open Sans Semibold',
                        'Arial Unicode MS Bold'
                    ],
                    'text-offset': [0, 1.25],
                    'text-anchor': 'top'
                }
            });
        }
        getRoute(coords);
    });
});

// https://docs.mapbox.com/mapbox-gl-js/example/add-image-animated/
const size = 150;
 
// This implements `StyleImageInterface`
// to draw a pulsing dot icon on the map.
const pulsingDot = {
    width: size,
    height: size,
    data: new Uint8Array(size * size * 4),
    
    // When the layer is added to the map,
    // get the rendering context for the map canvas.
    onAdd: function () {
        const canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        this.context = canvas.getContext('2d');
    },
    
    // Call once before every frame where the icon will be used.
    render: function () {
        const duration = 1000;
        const t = (performance.now() % duration) / duration;
        
        const radius = (size / 2) * 0.3;
        const outerRadius = (size / 2) * 0.7 * t + radius;
        const context = this.context;
        
        // Draw the outer circle.
        context.clearRect(0, 0, this.width, this.height);
        context.beginPath();
        context.arc(
            this.width / 2,
            this.height / 2,
            outerRadius,
            0,
            Math.PI * 2
        );
        context.fillStyle = `rgba(255, 200, 200, ${1 - t})`;
        context.fill();
        
        // Draw the inner circle.
        context.beginPath();
        context.arc(
            this.width / 2,
            this.height / 2,
            radius,
            0,
            Math.PI * 2
        );
        context.fillStyle = 'rgba(255, 100, 100, 1)';
        context.strokeStyle = 'white';
        context.lineWidth = 2 + 4 * (1 - t);
        context.fill();
        context.stroke();
        
        // Update this image's data with data from the canvas.
        this.data = context.getImageData(
            0,
            0,
            this.width,
            this.height
        ).data;
        
        // Continuously repaint the map, resulting
        // in the smooth animation of the dot.
        map.triggerRepaint();
        
        // Return `true` to let the map know that the image was updated.
        return true;
    }
};

// Add the geocoder to the map.
document.getElementById('geocoder').appendChild(geocoder.onAdd(map));
// Add geolocate control to the map.
document.getElementById('geolocate').appendChild(geolocate.onAdd(map));
// Add zoom and rotation controls to the map.
document.getElementById('navigation').appendChild(navigation.onAdd(map));

map.on('load', () => {
    map.setFog({}); // Set the default atmosphere style
    map.addImage('pulsing-dot', pulsingDot, { pixelRatio: 2 });

    map.loadImage(
        'img/parking-2.png',
        (error, image) => {
        if (error) throw error;
        map.addImage('parking-marker', image);
        }
    );

    map.loadImage(
        'img/google-maps.png',
        (error, image) => {
        if (error) throw error;
        map.addImage('google-marker', image);
        }
    );

    map.loadImage(
        'https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png',
        (error, image) => {
            if (error) throw error;
            map.addImage('custom-marker', image);
        }
    );

    // 展示目的地位置向外Buffer一定距離
    map.addSource('single-polygon', {
        type: 'geojson',
        data: {
            type: 'FeatureCollection',
            features: []
        }
    });

    map.addLayer({
        "id": "polygon-layer", 
        "type": "fill", 
        "source": "single-polygon", 
        "layout": {'visibility': 'visible'}, 
        'paint': {
            'fill-color': '#A5A051', // orange color fill
            'fill-opacity': 0.5
        }
    });
    map.addLayer({
        'id': 'polygon-outline',
        'type': 'line',
        'source': 'single-polygon',
        'layout': {'visibility': 'none'},
        'paint': {
            'line-color': '#000',
            'line-width': 2
        }
    });

    // 展示目的地位置
    map.addSource('destination-point', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
    });
    
    map.addLayer({
        id: 'point-layer',
        source: 'destination-point',
        type: 'symbol',
        layout: {
            'icon-image': 'google-marker', 
            'icon-size': 0.08, 
            'text-field': '', 
            'text-font': [
                'Open Sans Semibold',
                'Arial Unicode MS Bold'
            ],
            'text-offset': [0, 1.25],
            'text-anchor': 'top'
        }
    });

    // 為搜尋結果創建新圖層
    map.addSource('searchResult-points', {
        'type': 'geojson',
        'data': {
            type: 'FeatureCollection',
            features: []
        }
    });

    // Add a symbol layer
    map.addLayer({
        'id': 'searchResult-layer',
        'type': 'symbol', //symbol
        'source': 'searchResult-points',
        'layout': {
            'visibility': 'visible', 
            'icon-image': 'pulsing-dot', 
            // 'icon-image': 'parking-marker',
            // 'icon-size': 0.05, 
            // get the title name from the source's "title" property
            'text-field': ['get', 'name'],
            'text-font': [
                'Open Sans Semibold',
                'Arial Unicode MS Bold'
            ],
            'text-offset': [0, 1.25],
            'text-anchor': 'top'
        }
    });

    // Listen for the `result` event from the Geocoder
    // `result` event is triggered when a user makes a selection
    //  Add a marker at the result's coordinates
    geocoder.on('result', (event) => {
        destinationXY = event.result.geometry;
        destinationText = '您的目的地：' + event.result.text;
        map.getSource('destination-point').setData(destinationXY);
        map.setLayoutProperty('point-layer', 'text-field', destinationText);
        destinationName = event.result.place_name;
    });

    document.getElementById('fly').addEventListener('click', () => {
        if (typeof destinationXY !== 'undefined') {
            // Fly to a random location
            map.flyTo({
                center: destinationXY['coordinates'],
                zoom: 16, 
                essential: true // this animation is considered essential with respect to prefers-reduced-motion
            });
        } else {
            alert('請先選擇目的地！');
        }
    });

    // 顯示臺北市所有停車場位置
    map.addSource('parking-source', {
        type: 'geojson', 
        data: parkData
    });
    map.addLayer({
        id: 'parking-layer', 
        type: 'symbol', 
        source: 'parking-source', 
        layout: {
            'icon-image': 'parking-marker', 
            'icon-size': 0.05, 
            'text-field': ['get', 'name'], 
            'text-font': [
                'Open Sans Semibold',
                'Arial Unicode MS Bold'
            ],
            'text-offset': [0, 1.25],
            'text-anchor': 'top'
        }
    });

    // 所有底圖的屬性
    const basemap_titles = ['satellite', 'streets', 'watercolor', 'toner', 'terrain']
    var basemaps = {
        'satellite': {
            'title': 'Maptile Satellite', 
            'type': 'raster', 
            'url': 'https://api.maptiler.com/tiles/satellite-v2/{z}/{x}/{y}.jpg?key=Ybj8gpkC6cd7GdeGhAel', 
            'tileSize': 256
        }, 

        'streets': {
            'title': 'Maptile OpenStreetMap', 
            'type': 'raster', 
            'url': 'https://api.maptiler.com/maps/openstreetmap/256/{z}/{x}/{y}.jpg?key=Ybj8gpkC6cd7GdeGhAel', 
            'tileSize': 256
        }, 

        'watercolor': {
            'title': 'Stamen Watercolor', 
            'type': 'raster', 
            'url': 'https://stamen-tiles.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.jpg', 
            'tileSize': 256
        }, 
        
        'toner': {
            'title': 'Stamen Toner', 
            'type': 'raster', 
            'url': 'https://stamen-tiles.a.ssl.fastly.net/toner/{z}/{x}/{y}.png', 
            'tileSize': 256
        }, 

        'terrain': {
            'title': 'Stamen Terrain', 
            'type': 'raster', 
            'url': 'https://stamen-tiles.a.ssl.fastly.net/terrain/{z}/{x}/{y}.jpg', 
            'tileSize': 256
        }, 
    };

    for (let i=0; i < basemap_titles.length; i++) {
        map.addSource(basemap_titles[i] + '-source', {
            'type': basemaps[basemap_titles[i]]['type'],
            'tiles': [
                basemaps[basemap_titles[i]]['url']
                ],
            'tileSize': basemaps[basemap_titles[i]]['tileSize']
        });
        map.addLayer(
            {
                'id': basemap_titles[i] + '-layer',
                'type': basemaps[basemap_titles[i]]['type'],
                'source': basemap_titles[i] + '-source', 
                'layout': {
                    'visibility': "none"
                }, 
                'paint': {}
            },
        );
        // alert('Tiles successfully loaded!');
    }

    // Adds a clickable interface that enables a user to apply several different styles to the map
    const layerList = document.getElementById('basemap-collapsed');
    const inputs = layerList.getElementsByTagName('input');
    
    // 選擇底圖後切換圖層顯示/不顯示的屬性
    for (const input of inputs) {
        input.onclick = (layer) => {
            const base_layerId = layer.target.id; 
            console.log(base_layerId);
            // map.setStyle('mapbox://styles/mapbox/' + layerId);
            for (let i = 0; i < basemap_titles.length; i++) {
                map.setLayoutProperty(basemap_titles[i] + '-layer', 'visibility', 'none');
            }
            map.setLayoutProperty(base_layerId + '-layer', 'visibility', 'visible');
        };
    }
});

map.on('load', () => {
    map.loadImage(
        'https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png',
        (error, image) => {
        if (error) throw error;
        map.addImage('custom-marker', image);
        }
    );
});

// Display buildings in 3D
// https://docs.mapbox.com/mapbox-gl-js/example/3d-buildings/
map.on('style.load', () => {
    // Insert the layer beneath any symbol layer.
    const layers = map.getStyle().layers;
    const labelLayerId = layers.find(
        (layer) => layer.type === 'symbol' && layer.layout['text-field']
    ).id;
     
    // The 'building' layer in the Mapbox Streets
    // vector tileset contains building height data
    // from OpenStreetMap.
    map.addLayer(
        {
            'id': 'add-3d-buildings',
            'source': 'composite',
            'source-layer': 'building',
            'filter': ['==', 'extrude', 'true'],
            'type': 'fill-extrusion',
            'minzoom': 11,
            'paint': {
                'fill-extrusion-color': '#aaa',
                
                // Use an 'interpolate' expression to
                // add a smooth transition effect to
                // the buildings as the user zooms in.
                'fill-extrusion-height': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    15,
                    0,
                    15.05,
                    ['get', 'height']
                ],
                'fill-extrusion-base': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    15,
                    0,
                    15.05,
                    ['get', 'min_height']
                ],
                'fill-extrusion-opacity': 0.6
            }, 
            'layout': {
                'visibility': 'none'
            }
        },
        labelLayerId
    );
});

var sqlResults
var searchResults = {"type": "FeatureCollection", "features": []}
var pressDistance = document.getElementById('howFar');
let parkingType="";
const setParkingLotType = (type) => {
    parkingType = type;
};

// Execute a function when the user presses a key on the keyboard
pressDistance.addEventListener("keypress", function(event) {
    // If the user presses the "Enter" key on the keyboard
    if (event.key === "Enter") {
      // Cancel the default action, if needed
      event.preventDefault();
      // Trigger the button element with a click
      document.getElementById('search').click();
    }
});

function btnClick() {
    document.getElementById('instructions').style.display = "block";
    // Uncheck
    document.getElementById("parking-check-outlined").checked = false;
    let name = destinationName;
    let upperPriceTime= document.getElementById("upperRangeTime").value;
    let upperPriceHour = document.getElementById("upperRangeHour").value;
    let distance = document.getElementById("howFar").value;
    if (parkingType === '') {
        alert('請選擇停車場類型！');
    } else {
        console.log('地點', name, '停車費上限(/次)', upperPriceTime, '停車費上限(/時)', upperPriceHour, '類型', parkingType, '距離', distance);
    }
    var point = turf.point(destinationXY['coordinates']);
    var buffer = turf.buffer(point, distance, {units: 'meters'});

    map.getSource('single-polygon').setData(buffer);
    $.post('scripts/getdata.php', {name: name, upperPriceTime: upperPriceTime, upperPriceHour: upperPriceHour, parkingType: parkingType, distance: distance}, 
    //將post的資料顯示在網頁上
    function(data){
        // document.getElementById('results').value = data;
        console.log(data);
        sqlResults = JSON.parse(data);

        // 將回傳的GeoJSON改為WGS84
        for (let i = 0; i < sqlResults['features'].length; i++) {
            var coords = sqlResults['features'][i]['geometry']['coordinates'];
            const E = Number(coords[0]);
            const N = Number(coords[1]);
            sqlResults['features'][i]['geometry']['coordinates'] = proj4(EPSG3826, EPSG4326, [E, N]);
        }
        console.log(sqlResults);

        for (let i = 0; i < sqlResults['features'].length; i++) {
            var parking = turf.point(sqlResults['features'][i]['geometry']['coordinates']);
            if (turf.inside(parking, buffer)) {
                console.log(sqlResults['features'][i]['properties']['name']);
                searchResults['features'].push(
                    {
                        "type": "Feature", 
                        "properties": {
                            "id": sqlResults['features'][i]['properties']['id'], 
                            "area": sqlResults['features'][i]['properties']['area'], 
                            "name": sqlResults['features'][i]['properties']['name'], 
                            "type": sqlResults['features'][i]['properties']['type'], 
                            "payex": sqlResults['features'][i]['properties']['payex'], 
                            "address": sqlResults['features'][i]['properties']['address'], 
                            "summary": sqlResults['features'][i]['properties']['summary'], 
                            "totalcar": sqlResults['features'][i]['properties']['totalcar'], 
                            "totalmotor": sqlResults['features'][i]['properties']['totalmotor'], 
                            "FareInfo": sqlResults['features'][i]['properties']['FareInfo'], 
                            // "EntranceCoord": sqlResults['features'][i]['properties']['EntranceCoord']
                        }, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": sqlResults['features'][i]['geometry']['coordinates']
                        }
                    }
                )
            } else {
                //pass
            }
        }
    
        for (let j = 0; j < 5; j++) {
            var index = j + 1;
            var id;
            var parkingName;
            var parkingType;
            var payex;
            var address;
            var summary;
            var priceWorking;
            var totalcar;
            var availableCar;
            var availableMotor;
            var priceWorkingText;
            if (searchResults['features'][j]) {
                id = searchResults['features'][j]['properties']['id'];
                parkingName = searchResults['features'][j]['properties']['name'];
                parkingType = searchResults['features'][j]['properties']['type'];
                address = searchResults['features'][j]['properties']['address'];
                payex = searchResults['features'][j]['properties']['payex'];
                summary = searchResults['features'][j]['properties']['summary'];
                priceWorking = searchResults['features'][j]['properties']['FareInfo'];
                totalcar = searchResults['features'][j]['properties']['totalcar'];
                if (getAvaCarById(id, remainData).length > 0) {
                    availableCar = getAvaCarById(id, remainData)[0]['availableCar'];
                    availableMotor = getAvaCarById(id, remainData)[0]['availableMotor'];
                } else {
                    availableCar = '無資訊';
                    availableMotor = '無資訊';
                }
                priceWorkingText = '';
            } else {
                id = '-';
                parkingName = '-';
                parkingType = '-';
                payex = '-';
                address = '-';
                summary = '-';
                priceWorking = '-';
                totalcar = '-';
                availableCar = '-';
                availableMotor = '-';
                priceWorkingText = '-';
            }
    
            try {
                for (let k = 0; k < keys.length; k++) {
                    let keys = Object.keys(priceWorking);
                    priceWorkingText = priceWorkingText + priceWorking[keys[k]]['Period'] + '時：' + priceWorking[keys[k]]['Fare'] + '元<br/>';
                }
            } catch (e) {
                console.log('Object does not have a key.');
            }
    
            var tr = document.getElementById('row-' + index);
            tr.innerHTML = '<div class="row text-center d-flex align-items-center"><div class="col-1">'+id+'</div><div class="col-2">'+parkingName+'</div><div class="col-1">'+availableCar+
                '</div><div class="col-1">'+availableMotor+'</div><div class="col-1">'+priceWorking+'</div><div class="col-4">'+payex+'</div><div class="col-2">'+summary+'</div></div>';
        }
    
        var resultBtn = document.getElementById('resultBtn');
        resultBtn.click();
    
        // 清空搜尋結果
        searchResults['features'] = [];

        map.getSource('searchResult-points').setData(sqlResults);
        map.setLayoutProperty('parking-layer', 'visibility', 'none');
    });
};


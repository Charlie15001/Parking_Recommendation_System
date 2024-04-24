var randompts_ipl = turf.randomPoint(25, { bbox: [121.41, 24.34, 121.8, 24.65] });
function idw_itpl(features) {
    // turf.featureEach(features, function (point) {
    //     point.properties.obs = Math.random() * 20;
    // });

    // var idw_grid = turf.interpolate(features, 2, { gridType: 'square', property: 'obs', units: 'kilometers' });
    var idw_grid = turf.interpolate(features, 2, { gridType: 'square', property: 'subsidence', units: 'kilometers' });
    //成果會是geojson
    return idw_grid;
}

var idw_polygon;

function get_selected_value() {
    var e = document.getElementById('analysis-select');
    var value = e.value;
    console.log(value);
    return value;
}

function execute_spatial_analysis(features) {
    value = get_selected_value();
    if (value == 1) {
        // idw_polygon = idw_itpl(randompts_ipl);
        idw_polygon = idw_itpl(features);
        console.log('Interpolation Executed.');
    } else {
        alert('Features not found!');
    }
}

function show_results(map_object, features, feature_layer_id) {
    var point_layer = map_object.getLayer(feature_layer_id);
    if (point_layer) {
        map_object.addSource('Polygon', {
            'type': 'geojson', 
            'data': features
        });
    
        // Add a new layer to visualize the polygon.
        map.addLayer({
            'id': 'Polygon-layer',
            'type': 'fill',
            'source': 'Polygon', // reference the data source
            'layout': {},
            'paint': {
                // 'fill-color': '#0080ff', // blue color fill
                'fill-color': {
                    property: 'subsidence', 
                    stops: [
                        [-0.04, '#ff4000'], 
                        [-0.03, '#ff8000'], 
                        [-0.02, '#ffbf00'], 
                        [-0.01, '#ffff00'], 
                        [0, '#bfff00']
                    ]
                }, 
                'fill-opacity': 0.5
            }
        }, 
        feature_layer_id);
    } else {
        console.log('Layer unfound!');
    }
}



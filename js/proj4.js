proj4.defs("EPSG:4326","+proj=longlat +datum=WGS84 +no_defs +type=crs");
proj4.defs("EPSG:3826","+proj=tmerc +lat_0=0 +lon_0=121 +k=0.9999 +x_0=250000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs");
proj4.defs("EPSG:3857","+proj=merc +a=6378137 +b=6378137 +lat_ts=0 +lon_0=0 +x_0=0 +y_0=0 +k=1 +units=m +nadgrids=@null +wktext +no_defs +type=crs");

//EPSG
let EPSG3826 = new proj4.Proj('EPSG:3826'); //TWD97 TM2(121分帶)
let EPSG3857 = new proj4.Proj('EPSG:3857'); //TWD67 TM2(121分帶)
let EPSG4326 = new proj4.Proj('EPSG:4326'); //WGS84

//4326轉3826(WGS84經緯度轉TWD97 TM2)
let data1 = proj4(EPSG4326, EPSG3826, [121, 23]);
// document.getElementById('cv4326_3826').innerHTML = data1;
// console.log(data1);
//[250000,2544283.12479424]

//3826轉3828(TWD97 TM2轉TWD67 TM2)
let data2 = proj4(EPSG3826, EPSG3857, data1);
// document.getElementById('cv3826_3828').innerHTML = data2;
// console.log(data2);
//[249171.10594810007, 2544488.5274230908]
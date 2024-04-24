<?php
require_once("mysql.php");

// $db_servername = "db.sgis.tw";     //db.sgis.tw
// $db_username = "webgis";           //webgis
// $db_password = "webgis2021";       //  sinica2021     
// $db_database = "webgis";
// $db_port = "3306";                //database port, default:3306

$db_servername = "localhost";     //db.sgis.tw
$db_username = "root";           //webgis, r10521809
$db_password = "Charlie15001";       //  sinica2021     
$db_database = "webgis";
$db_port = "3306";                //database port, default:3306

$name = $_POST['name'];
$upperPriceTime = $_POST['upperPriceTime'];
$upperPriceHour = $_POST['upperPriceHour'];
$parkingType = $_POST['parkingType'];
$distance = $_POST['distance'];

try {     // 連線至DB
  // Build GeoJSON feature collection array
  $searchResult = array(
    'type' => 'FeatureCollection', 
    'features' => array()
  );
  $db = new mysql($db_servername,$db_port,$db_username,$db_password,$db_database);
  // $sql="SELECT * FROM `webgis`.`airportMetro` WHERE `stype`=:stype";
  if($parkingType=='全部') {
    $sql="SELECT * FROM `webgis`.`parking_0104` WHERE `FareInfo`<=:upperPriceHour AND `FareInfo`>=0";
  } else {
    $sql="SELECT * FROM `webgis`.`parking_0104` WHERE `FareInfo`<=:upperPriceHour AND `FareInfo`>=0 AND `type`='$parkingType'";
  }
  // $sql="SELECT * FROM `webgis`.`parking_0104` WHERE `FareInfo`<=:upperPriceHour AND `FareInfo`>=0 AND `type`=:parkingType";
  // $sql="SELECT * FROM `webgis`.`parking_0104` WHERE `FareInfo`<=:upperPriceHour AND `FareInfo`>=0 AND `type`='$parkingType'";
  // $result = $_GET['location'];
  // echo $result;

  if(($rss=$db->query($sql,[
    // 'stype'=>'地下車站'
    // 'stype'=>$name
    'upperPriceHour'=>$upperPriceHour, 
    // 'parkingType'=>$parkingType
  ]))!==false){
    //echo var_dump($rss);
    foreach($rss as $rs){
      // echo "{$rs['name']},{$rs['stype']},{$rs['lat']},{$rs['lng']}<br />\n";
      $feature = array(
        'type' => 'Feature', 
        'geometry' => array(
          'type' => 'Point', 
          'coordinates' => array(
            $rs['twd97x'], 
            $rs['twd97y']
          )
        ), 
        'properties' => array(
          'id' => $rs['id'], 
          'area' => $rs['area'], 
          'name' => $rs['name'], 
          'type' => $rs['type'], 
          'payex' => $rs['payex'], 
          'address' => $rs['address'], 
          'summary' => $rs['summary'], 
          'totalcar' => $rs['totalcar'], 
          'totalmotor' => $rs['totalmotor'], 
          'FareInfo' => $rs['FareInfo']
        )
      );
      # Add feature arrays to feature collection array
      array_push($searchResult['features'], $feature);
    }
  }
  $searchResult = json_encode($searchResult, JSON_UNESCAPED_UNICODE);
  // echo "var javascript_array = ". $js_array . ";\n";
  echo $searchResult;

}catch(PDOException $e){
  $db = false;
  echo "[error] database connect error.\n";
  exit;
}
?>
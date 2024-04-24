<!DOCTYPE html>
<html lang="zh-tw">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <!-- <meta name="viewport" content="width=device-width, initial-scale=1"> -->
	<!-- <meta name="viewport" content="initial-scale=1,maximum-scale=1,user-scalable=no">

    <meta name="description" content="Source code generated using layoutit.com">
    <meta name="author" content="LayoutIt!"> -->

    <link href="css/bootstrap.min.css" rel="stylesheet">
    <link href="css/style.css" rel="stylesheet">
	<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.3.0/font/bootstrap-icons.css">
	<link href="https://api.mapbox.com/mapbox-gl-js/v2.11.0/mapbox-gl.css" rel="stylesheet">
	<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js" integrity="sha384-MrcW6ZMFYlzcLA8Nl+NtUVF0sA7MsXsP1UyJoMp4YLEuNSfAP+JcXn/tWtIaxVXM" crossorigin="anonymous"></script>
	<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.1/jquery.min.js"></script>
	<!-- include turf.js and use it -->
	<script src='https://unpkg.com/@turf/turf@6/turf.min.js'></script>
	<!-- 引入proj4坐標轉換工具 -->
	<script src="https://cdnjs.cloudflare.com/ajax/libs/proj4js/2.8.0/proj4.js"></script>
	<script type="text/javascript" src="js/proj4.js"></script>
	<script type="text/javascript" src="js/read_json.js"></script>
	<script type="text/javascript" src="js/turf.js"></script>
	<link href="https://api.mapbox.com/mapbox-gl-js/v2.11.0/mapbox-gl.css" rel="stylesheet">
	<script src="https://api.mapbox.com/mapbox-gl-js/v2.11.0/mapbox-gl.js"></script>
	<!-- Add the Geocoder -->
	<script src='https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v4.7.0/mapbox-gl-geocoder.min.js'></script>
	<link rel='stylesheet' href='https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v4.7.0/mapbox-gl-geocoder.css' type='text/css' />
	<link href="https://api.mapbox.com/directions/v5/mapbox/cycling/-84.518641,39.134270;-84.512023,39.102779?geometries=geojson&access_token=pk.eyJ1IjoiZXJpY2EwODI5IiwiYSI6ImNsYnhlMGxtazBjeG0zb21ubmFhamYwOXcifQ.mYeN5zj1fUsFCo5DcA8h6w">
    <script src='https://api.tiles.mapbox.com/mapbox-gl-js/v2.11.0/mapbox-gl.js'></script>
    <link href='https://api.tiles.mapbox.com/mapbox-gl-js/v2.11.0/mapbox-gl.css' rel='stylesheet' />
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.3/font/bootstrap-icons.css">
	<style>
		body { margin: 0; padding: 0; }
		#map { position: absolute; top: 0; bottom: 0; height: 100%; width: 100%; z-index: -1;}
		#instructions {
			display: none; 
			position: absolute; 
			margin: 20px; 
			width: 25%; 
			top: 15%; 
			bottom: 45%; 
			padding: 20px; 
			background-color: #fff; 
			overflow-y: scroll; 
			font-family: sans-serif; 
			z-index: 1;}
		.table {position: absolute; bottom: 0;}
		.mapboxgl-ctrl-geocoder {
			min-width: 100%;
		}
	</style>
  </head>

  <body>
    <div class="container-fluid" style="z-index: 20;">
		<div class="row">
			<div class="col-md-12">
				<nav class="navbar navbar-expand-lg navbar-dark bg-dark">
					<button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1">
						<span class="navbar-toggler-icon"></span>
					</button>
					<h2><a class="navbar-brand" href="#">停車場推薦系統</a></h2>
					<div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
						<form class="form-inline">
							<div id="geocoder" class="geocoder mx-1" aria-placeholder="輸入目的地"></div>
							<input hidden class="form-control mr-sm-2 mx-1" type="text" id ='upperRangeTime' placeholder="輸入停車費上限(元/次)">
							<input class="form-control mr-sm-2 mx-1" type="text" id ='upperRangeHour' placeholder="輸入停車費上限(元/時)">
							<ul class="navbar-nav ml-md-auto">
								<input class="form-control mr-sm-2" type="text" id ='howFar' placeholder="可接受步行距離(公尺)">
								<li class="nav-item dropdown">
									<a class="nav-link dropdown-toggle" id="navbarDropdownMenuLink" data-toggle="dropdown">選擇停車場種類</a>
									<div class="dropdown-menu dropdown-menu-right" aria-labelledby="navbarDropdownMenuLink">
										<a class="dropdown-item" onclick="setParkingLotType('全部');document.getElementById('navbarDropdownMenuLink').text='全部'">全部</a>
										<a class="dropdown-item" onclick="setParkingLotType('平面式');document.getElementById('navbarDropdownMenuLink').text='平面式'">平面式</a>
										<a class="dropdown-item" onclick="setParkingLotType('立體式');document.getElementById('navbarDropdownMenuLink').text='立體式'">立體式</a> 
										<a class="dropdown-item" onclick="setParkingLotType('塔台式');document.getElementById('navbarDropdownMenuLink').text='塔台式'">塔台式</a>
										<a class="dropdown-item" onclick="setParkingLotType('機械式');document.getElementById('navbarDropdownMenuLink').text='機械式'">機械式</a>
										<a class="dropdown-item" onclick="setParkingLotType('其他');document.getElementById('navbarDropdownMenuLink').text='其他'">其他</a>
									</div>
								</li>
								<button class="btn btn-primary my-2 my-sm-0" type="button" id="search" onclick="btnClick()">
									搜尋
								</button>
							</ul>
						</form>
					</div>
				</nav>
			</div>
		</div>
		<div class="row-sm-12 my-sm-3">
			<div id="geolocate" class="d-flex justify-content-end"></div>
		</div>
		<div class="row-sm-12 my-sm-3">
			<div id="navigation" class="d-flex justify-content-end"></div>
		</div>
	</div>
	<div class="fixed-bottom align-items-end">
		<div class="container-fluid row-sm-12 my-sm-2 d-flex justify-content-end">
			<!-- zoom in到目的地 -->
			<button type="button" class="btn btn-outline-dark" id="fly" style="z-index: 1;">
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-geo-alt-fill" viewBox="0 0 16 16">
					<path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
				</svg>
			</button>
		</div>
		<div class="container-fluid row-sm-12 my-sm-2 d-flex justify-content-end" style="z-index: 1;">
			<!-- 打開/關閉所有停車場 -->
			<input type="checkbox" class="btn-check d-flex align-items-center" id="parking-check-outlined" autocomplete="off" onclick="showAllParkinglots();" checked>
			<label class="btn btn-outline-dark" for="parking-check-outlined">
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-p-square-fill" viewBox="0 0 16 16">
					<path d="M8.27 8.074c.893 0 1.419-.545 1.419-1.488s-.526-1.482-1.42-1.482H6.778v2.97H8.27Z"/>
					<path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2Zm3.5 4.002h2.962C10.045 4.002 11 5.104 11 6.586c0 1.494-.967 2.578-2.55 2.578H6.784V12H5.5V4.002Z"/>
				</svg>
			</label><br>
		</div>
		<div class="container-fluid row-sm-12 my-sm-2 d-flex align-items-center justify-content-end" style="z-index: 1;">
			<input type="checkbox" class="btn-check d-flex align-items-center" id="btn-check-outlined" autocomplete="off" onclick="showBuildings();">
			<label class="btn btn-outline-dark" for="btn-check-outlined">
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-house-fill" viewBox="0 0 16 16">
					<path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L8 2.207l6.646 6.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.707 1.5Z"/>
					<path d="m8 3.293 6 6V13.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 13.5V9.293l6-6Z"/>
				</svg>
			</label><br>
		</div>
		<div class="card" style="z-index: 10;">
			<div class="card-body bg-dark text-light">
				<button id="resultBtn" class="btn btn-dark" style="z-index: 10;" type="button" aria-expanded="false" data-bs-toggle="collapse" data-bs-target="#collapse-table">
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-hand-index" viewBox="0 0 16 16">
						<path d="M6.75 1a.75.75 0 0 1 .75.75V8a.5.5 0 0 0 1 0V5.467l.086-.004c.317-.012.637-.008.816.027.134.027.294.096.448.182.077.042.15.147.15.314V8a.5.5 0 1 0 1 0V6.435a4.9 4.9 0 0 1 .106-.01c.316-.024.584-.01.708.04.118.046.3.207.486.43.081.096.15.19.2.259V8.5a.5.5 0 0 0 1 0v-1h.342a1 1 0 0 1 .995 1.1l-.271 2.715a2.5 2.5 0 0 1-.317.991l-1.395 2.442a.5.5 0 0 1-.434.252H6.035a.5.5 0 0 1-.416-.223l-1.433-2.15a1.5 1.5 0 0 1-.243-.666l-.345-3.105a.5.5 0 0 1 .399-.546L5 8.11V9a.5.5 0 0 0 1 0V1.75A.75.75 0 0 1 6.75 1zM8.5 4.466V1.75a1.75 1.75 0 1 0-3.5 0v5.34l-1.2.24a1.5 1.5 0 0 0-1.196 1.636l.345 3.106a2.5 2.5 0 0 0 .405 1.11l1.433 2.15A1.5 1.5 0 0 0 6.035 16h6.385a1.5 1.5 0 0 0 1.302-.756l1.395-2.441a3.5 3.5 0 0 0 .444-1.389l.271-2.715a2 2 0 0 0-1.99-2.199h-.581a5.114 5.114 0 0 0-.195-.248c-.191-.229-.51-.568-.88-.716-.364-.146-.846-.132-1.158-.108l-.132.012a1.26 1.26 0 0 0-.56-.642 2.632 2.632 0 0 0-.738-.288c-.31-.062-.739-.058-1.05-.046l-.048.002zm2.094 2.025z"/>
					</svg>
					停車場搜尋結果
				</button>
			</div>
		</div>
	</div>
	
	<div class="collapse fixed-bottom" id="collapse-table" style="z-index: 5;">
		<div class="card card-body bg-dark text-light">
			<div class="row text-center">
				<div class="col-1">#</div>
				<div class="col-2">停車場</div>
				<div class="col-1">剩餘汽車位</div>
				<div class="col-1">剩餘機車位</div>
				<div class="col-1">價格(元/時)</div>
				<div class="col-4">收費方式</div>
				<div class="col-2">備註</div>
			</div>
		</div>
		<div class="card card-body" id="row-1">
			<div class="text-light">Row</div>
		</div>
		<div class="card card-body" id="row-2">
			<div class="text-light">Row</div>
		</div>
		<div class="card card-body" id="row-3">
			<div class="text-light">Row</div>
		</div>
		<div class="card card-body" id="row-4">
			<div class="text-light">Row</div>
		</div>
		<div class="card card-body" id="row-5">
			<div class="text-light">Row</div>
		</div>
		<div class="card card-body bg-dark text-light">
			Row
		</div>
	</div>

	<div id="map"></div>
	<div id="instructions"></div>
	<script src="js/jquery.min.js"></script>
	<script src="js/bootstrap.min.js"></script>
	<script src="js/map.js"></script>
	<script>
		<?php //require_once('scripts/getdata.php')?>;
	</script>
  </body>
</html>
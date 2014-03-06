//disclaimer text
function showDisclaimer() {
    window.alert("The maps on this page do not imply the expression of any opinion concerning the legal status of a territory or of its authorities.");
}

var tileLayerUrl = 'http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png';
var attribution = 'Map data &copy; <a href="http://openstreetmap.org" target="_blank">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/" target="_blank">CC-BY-SA</a> | Map style by <a href="http://hot.openstreetmap.org" target="_blank">H.O.T.</a> | &copy; <a href="http://redcross.org" title="Red Cross" target="_blank">Red Cross</a> 2013 | <a title="Disclaimer" onClick="showDisclaimer();">Disclaimer</a>';
var tileLayer = L.tileLayer(tileLayerUrl, {attribution: attribution});

var map = L.map('map', {scrollWheelZoom: false}).setView([11.14899, 125.00064], 17);

tileLayer.addTo(map);

var pointData;

function getPointData(){
  $.ajax({
      type: 'GET',
      url: 'data/shelterRecoveryDemo.json',
      contentType: 'application/json',
      dataType: 'json',
      timeout: 10000,
      success: function(json) {
        pointData = json;        
        markersToMap();
      },
      error: function(e) {
          console.log(e);
      }
  });
}

var featureEvents = function (feature, layer) {
    layer.on({
        mouseover: markerInfo,
        mouseout: defaultInfo
    });       
}

function markerInfo(e) {
    var house = e.target; 
    $("#houseProjectType").html(house.feature.properties.support);
    $("#houseFinancingPartner").html(house.feature.properties.partner);
    $("#houseDateCompleted").html(house.feature.properties.dateEnd);
    var picPath = "images/houses/" + house.feature.properties.housepic + ".jpg";
    $("#housePic").attr('src', picPath);
    $("#defaultSidebar").hide();
    $(".houseInfo").show();
}

function defaultInfo() {
  $(".houseInfo").hide();
  $("#defaultSidebar").show();
}



function markersToMap(){
  L.geoJson(pointData, {
    onEachFeature: featureEvents
  }).addTo(map);
}

getPointData();


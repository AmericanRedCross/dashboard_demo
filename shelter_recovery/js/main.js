//disclaimer text
function showDisclaimer() {
    window.alert("The maps on this page do not imply the expression of any opinion concerning the legal status of a territory or of its authorities.");
}

var tileLayerUrl = 'http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png';
var attribution = 'Map data &copy; <a href="http://openstreetmap.org" target="_blank">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/" target="_blank">CC-BY-SA</a> | Map style by <a href="http://hot.openstreetmap.org" target="_blank">H.O.T.</a> | &copy; <a href="http://redcross.org" title="Red Cross" target="_blank">Red Cross</a> 2013 | <a title="Disclaimer" onClick="showDisclaimer();">Disclaimer</a>';
var tileLayer = L.tileLayer(tileLayerUrl, {attribution: attribution});

var map = L.map('map', {
  scrollWheelZoom: false,
  zoom: 0,
  layers: [tileLayer]
});

var pointData;
var mapPoints = [];
var markers = new L.MarkerClusterGroup();
var markersBounds = [];

var centroidOptions = {
    radius: 8,
    fillColor: "#ED1B2E",
    color: "#FFF",
    weight: 2.5,
    opacity: 1,
    fillOpacity: 1
};

// reset map bounds using Zoom to Extent button
function zoomOut() {
    map.fitBounds(markersBounds);
    defaultInfo();
}

function getPointData(){
  $.ajax({
      type: 'GET',
      url: 'data/PointDataCollectionDemo_Formhub_2014_03_09_06_57_05.json',
      contentType: 'application/json',
      dataType: 'json',
      timeout: 10000,
      success: function(json) {
        pointData = json;        
        formatPoints();
      },
      error: function(e) {
          console.log(e);
      }
  });
}

function formatPoints(){
    $.each(pointData, function(index, item) {
        latlng = [item._pt_location_longitude, item._pt_location_latitude];
        var mapPoint = {
            "type": "Feature",
            "properties": {
                "user_select": item.user_select,
                "user_text": item.user_text,
                "user_date": item.user_date,                                        
                "user_integer": item.user_integer,
                "pt_photo": item.pt_photo  
            },
            "geometry": {
                "type": "Point",
                "coordinates": latlng
            }
        }
        mapPoints.push(mapPoint);
    }); 
    markersToMap();
}

function markerInfo(e) {
  var pt = e.target;
  $("#user_select").html(pt.feature.properties.user_select);
  $("#user_text").html(pt.feature.properties.user_text);
  $("#user_date").html(pt.feature.properties.user_date);
  var picPath = "images/houses/" + pt.feature.properties.pt_photo;
  $("#pt_photo").attr('src', picPath);
  $("#defaultSidebar").hide();
  $(".ptInfo").show();
}

function defaultInfo() {
  $(".ptInfo").hide();
  $("#defaultSidebar").show();
}

function markersToMap(){
  map.removeLayer(markers);
  markers = new L.MarkerClusterGroup({
      showCoverageOnHover:false, 
      maxClusterRadius: 15,   
      spiderfyDistanceMultiplier:2
  });
  marker = L.geoJson(mapPoints, {
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, centroidOptions);
    },
    onEachFeature: function (feature, layer) {
      layer.on({
        click: markerInfo
      }); 
    }         
  });
  markers.addLayer(marker);
  markers.addTo(map);
  markersBounds = markers.getBounds();
  markersBounds._northEast.lat += 0.05;
  markersBounds._northEast.lng += 0.05;
  markersBounds._southWest.lat -= 0.05;
  markersBounds._southWest.lat -= 0.05;
  map.fitBounds(markersBounds);  
}

getPointData();


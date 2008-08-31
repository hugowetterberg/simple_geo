
google.setOnLoadCallback(function() {
  
  var wkt_to_latlng = function(wkt) {
    var coords = wkt.split(' ');
    if (coords.length >= 2) {
      return new GLatLng(coords[0], coords[1])
    }
  }
  
  var polygon_wkt_to_latlng = function(wkt) {
    var pairs = wkt.split(',');
    var pair_count = pairs.length;
    var coords = [];
    for (var i=0; i<pair_count; i++) {
      var c = wkt_to_latlng(pairs[i]);
      if(c) {
        coords.push(c);
      }
    }
    return coords;
  }
  
  var wkt_coord = function(ll) {
    return ll.lat() + ' ' + ll.lng();
  }
  
  jQuery('#edit-simple-geo-position-wrapper').hide();
  jQuery('#edit-simple-geo-area-wrapper').hide();
  
  var placeholder = jQuery('.map-placeholder:first').css({'width': '100%', 'height': '400px'}).get(0);
  var map = new google.maps.Map2(placeholder);
  map.setCenter(new google.maps.LatLng(55.675455,12.59119), 13);
  var aCoords = jQuery('#edit-simple-geo-area').attr('value');
  var pCoords = jQuery('#edit-simple-geo-position').attr('value');
  
  var color = "#ff0000";
  
  var polygon = new GPolygon([], color, 2, 0.7, color, 0.2);
  
  map.addOverlay(polygon);
  polygon.enableDrawing();
  polygon.enableEditing({onEvent: "mouseover"});
  
  var polygon_default = polygon_wkt_to_latlng(aCoords);
  for(var i=0; i<polygon_default.length; i++) {
    polygon.insertVertex(i, polygon_default[i]);
  }
  
  var marker_default = wkt_to_latlng(pCoords);
  if (!marker_default) {
    marker_default = map.getCenter()
  }
  else {
    map.setCenter(marker_default, 13);
  }
  
  var marker = new GMarker(marker_default, {draggable: true});

  GEvent.addListener(marker, "dragstart", function() {
  });

  GEvent.addListener(marker, "dragend", function() {
    jQuery('#edit-simple-geo-position').attr('value',wkt_coord(this.getLatLng()));
  });
  
  GEvent.addListener(polygon, "lineupdated", function() {
    var vCount = this.getVertexCount();
    var cArray = [];
    for(var i=0; i<vCount; i++) {
      cArray.push(wkt_coord(this.getVertex(i)));
    }
    jQuery('#edit-simple-geo-area').attr('value',cArray.join(','));
  });

  map.addOverlay(marker);
});
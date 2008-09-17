// $Id$

if (google && google.load) {
  google.load('maps', '2.x');
  
  jQuery(document).ready(function() {
    
    //Creates a LatLng object from a coordinate string
    var wkt_to_latlng = function(wkt) {
      var coords = wkt.split(' ');
      if (coords.length >= 2) {
        return new google.maps.LatLng(coords[0], coords[1]);
      }
    },
    //Creates an array of LatLng objects from a coordinate list string
    polygon_wkt_to_latlng = function(wkt) {
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
    },
    wkt_coord = function(ll) {
      return ll.lat() + ' ' + ll.lng();
    };
    
    jQuery('#edit-simple-geo-position-wrapper').hide().length;
    var has_area = jQuery('#edit-simple-geo-area-wrapper').hide().length;
    
    //Create map view
    var placeholder = jQuery('.map-placeholder:first').css({'width': '100%', 'height': '400px'}).get(0);
    var map = new google.maps.Map2(placeholder);
    
    //Get coordinate data
    var aCoords = jQuery('#edit-simple-geo-area').attr('value');
    var pCoords = jQuery('#edit-simple-geo-position').attr('value');
    
    //Center the map on the position if we have one
    var position = wkt_to_latlng(pCoords ? pCoords : '');
    if (!position) {
      position = new google.maps.LatLng(55.675455,12.59119);//Make this coordinate configurable or intelligent
    }
    map.setCenter(position, 13);
    
    //Create our marker and make it draggable
    var marker = new GMarker(position, {draggable: true});
    // GEvent.addListener(marker, "dragstart", function() {
    // });
    
    var moved = false;
    
    //Update the position text-field on drag end
    GEvent.addListener(marker, "dragend", function() {
      moved = true;
      jQuery('#edit-simple-geo-position').attr('value',wkt_coord(this.getLatLng()));
    });
    
    jQuery(document).one('nodeLoaded', function (e, nid) {
      if (!moved) {
        Drupal.service('node.get', 
          [
            nid,
            ['simple_geo_position']
          ], 
          function (res, err) {
            if (res && res.simple_geo_position && !moved) {
              var position = wkt_to_latlng(res.simple_geo_position);
              map.setCenter(position, 13);
              marker.setLatLng(position);
            }
          }
        );
      }
    });
    
    //Add the marker to the map
    map.addOverlay(marker);
    
    if (has_area) {
      //Create the polygon and set it up so that the user can edit it
      var color = "#ff0000";
      var polygon = new GPolygon([], color, 2, 0.7, color, 0.2);
      map.addOverlay(polygon);
      polygon.enableDrawing();
      polygon.enableEditing({onEvent: "mouseover"});

      //Add existing vertexes to the polygon. Adding them before 
      //drawing and editing is enabled results in strange behaviour
      var polygon_default = polygon_wkt_to_latlng(aCoords);
      for(var i=0; i<polygon_default.length; i++) {
        polygon.insertVertex(i, polygon_default[i]);
      }

      //Update the area textarea when the polygon is updated
      //TODO: This should be done on form submit, as it's slightly 
      //more expensive than it's position counterpart.
      GEvent.addListener(polygon, "lineupdated", function() {
        var vCount = this.getVertexCount();
        var cArray = [];
        for(var i=0; i<vCount; i++) {
          cArray.push(wkt_coord(this.getVertex(i)));
        }
        jQuery('#edit-simple-geo-area').attr('value',cArray.join(','));
      });
    }
  });
}
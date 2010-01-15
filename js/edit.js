// $Id$

/*global google, jQuery, Drupal, GSmallMapControl, GIcon, G_DEFAULT_ICON, GSize, GPoint, GMarker, LookupControl, GEvent, GPolygon */

function EditControl(position, polygon, custom_marker_handling) {
  this.position = position;
  this.polygon = polygon;
  this.custom_marker_handling = custom_marker_handling;
}
EditControl.prototype = new GControl();

EditControl.prototype.getDefaultPosition = function () {
  return new GControlPosition(G_ANCHOR_TOP_LEFT, new GSize(100, 3));
};

EditControl.prototype.initialize = function (map) {
  var container, control, polyButton, posButton;

  container = jQuery('<div class="edit-toolbar"></div>').appendTo(map.getContainer()).get(0);
  if (this.position) {
    posButton = jQuery('<a class="button"><img src="http://www.google.com/mapfiles/marker.png"></img></a>').appendTo(container);
    posButton.click(function() {
      control.stopPolygonEdit();
    });
  }
  if (this.polygon) {
    polyButton = jQuery('<a class="button"><img src="http://www.google.com/mapfiles/markerZ.png"></img></a>').appendTo(container);
    polyButton.click(function() {
      control.startPolygonEdit();
    });
  }

  control = this;
  this.container = container;
  return container;
};

if (google && google.load) {
  google.load('maps', '2.x');

  jQuery(document).ready(function () {

    var has_position, has_area, placeholder, map, aCoords, pCoords, position, icon, resetDesc, resetButton, resetBox,
    marker, lookup, edit, color, polygon, polygon_default, i,
    //Creates a LatLng object from a coordinate string
    wkt_to_latlng = function (wkt) {
      var coords = wkt.split(' ');
      if (coords.length >= 2) {
        return new google.maps.LatLng(coords[0], coords[1]);
      }
    },
    //Creates an array of LatLng objects from a coordinate list string
    polygon_wkt_to_latlng = function (wkt) {
      var pairs, pair_count, coords, i, c;

      pairs = wkt.split(',');
      pair_count = pairs.length;
      coords = [];

      for (i = 0; i < pair_count; i += 1) {
        c = wkt_to_latlng(pairs[i]);
        if (c) {
          coords.push(c);
        }
      }

      return coords;
    },
    wkt_coord = function (ll) {
      return ll.lat() + ' ' + ll.lng();
    },
    default_position = function () {
      var def = wkt_to_latlng(Drupal.settings.simple_geo_default_position ? Drupal.settings.simple_geo_default_position : '');
      if (!def) {
        def = new google.maps.LatLng(55.675455, 12.59119);
      }
      return def;
    };

    has_position = jQuery('#edit-simple-geo-position-wrapper').hide().length;
    has_area = jQuery('#edit-simple-geo-area-wrapper').hide().length;

    //Create map view
    placeholder = jQuery('.map-placeholder:first').css({'width': '100%', 'height': '400px'}).get(0);
    map = new google.maps.Map2(placeholder);
    map.addControl(new GSmallMapControl());

    //Get coordinate data
    aCoords = jQuery('#edit-simple-geo-area').attr('value');
    pCoords = jQuery('#edit-simple-geo-position-wrapper input[type=text]').attr('value');

    //Center the map on the position if we have one
    position = default_position();
    if (pCoords) {
      position = wkt_to_latlng(pCoords);
    }
    if (!position) {
      position = default_position();
    }
    map.setCenter(position, Number(Drupal.settings.simple_geo_min_zoom));

    //Create our marker and make it draggable
    if (Drupal.settings.user_map) {
      icon = new GIcon(G_DEFAULT_ICON);
      icon.shadow = null;
      icon.iconSize = new GSize(20, 29);
      icon.iconAnchor = new GPoint(9, 29);
      icon.image = Drupal.settings.user_map.favicon_path + '/default/0/marker.png';
    }

    resetBox = jQuery('<div class="reset-position"></div>');
    resetButton = Drupal.t('Remove position');
    resetDesc = Drupal.t('Resets the marker to default position');
    marker = new GMarker(position, {draggable: true, icon: icon});
    jQuery('<a class="form-button" href="#" title="' + resetDesc + '"><span>' + resetButton + '</span></a>').appendTo(resetBox).click(function () {
      var def = default_position();
      marker.setLatLng(def);
      map.setCenter(def, Number(Drupal.settings.simple_geo_min_zoom));
      jQuery('#edit-simple-geo-position-wrapper input[type=text]').attr('value', '');
      return false;
    }).after('<span class="description">' + resetDesc + '</span>');

    lookup = new LookupControl(true);
    map.addControl(lookup);
    jQuery(lookup.container).bind('positioned', function (evt, coord) {
      marker.setLatLng(coord);
      map.setCenter(coord, Number(Drupal.settings.simple_geo_max_zoom));
      jQuery('#edit-simple-geo-position-wrapper input[type=text]').val(wkt_coord(coord));
    });
    resetBox.insertAfter(placeholder);

    //Update the position text-field on drag end
    GEvent.addListener(marker, "dragend", function () {
      jQuery('#edit-simple-geo-position-wrapper input[type=text]').attr('value', wkt_coord(this.getLatLng()));
    });

    //Listen for node loaded events to get default positions (used for group based position for nodes)
    jQuery(document).one('nodeLoaded', function (e, nid) {
      var curr_pos = jQuery('#edit-simple-geo-position').attr('value');
      if (!curr_pos.length) {
        Drupal.service('node.get',
          [
            nid,
            ['simple_geo_position']
          ],
          function (res, err) {
            if (res && res.simple_geo_position) {
              var position = wkt_to_latlng(res.simple_geo_position);
              map.setCenter(position, Number(Drupal.settings.simple_geo_max_zoom));
              marker.setLatLng(position);
              jQuery('#edit-simple-geo-position-wrapper input[type=text]').attr('value', res.simple_geo_position);
            }
          }
        );
      }
    });

    //Add the marker to the map
    if (has_position) {
      map.addOverlay(marker);
    }

    if (has_area) {
      //Create the polygon and set it up so that the user can edit it
      color = "#ff0000";
      polygon = new GPolygon([], color, 2, 0.7, color, 0.2);
      map.addOverlay(polygon);

      //Add existing vertexes to the polygon. Adding them before
      //drawing and editing is enabled results in strange behaviour
      polygon_default = polygon_wkt_to_latlng(aCoords);
      for (i = 0; i < polygon_default.length; i += 1) {
        polygon.insertVertex(i, polygon_default[i]);
      }

      //Update the area textarea when the polygon is updated
      //TODO: This should be done on form submit, as it's slightly
      //more expensive than it's position counterpart.
      GEvent.addListener(polygon, "lineupdated", function () {
        var vCount = this.getVertexCount(), cArray = [], i;
        for (i = 0; i < vCount; i += 1) {
          cArray.push(wkt_coord(this.getVertex(i)));
        }
        jQuery('#edit-simple-geo-area').attr('value', cArray.join(','));
      });
    }

    edit = new EditControl(has_position, has_area, true);
    edit.startPolygonEdit = function () {
      polygon.enableDrawing();
      polygon.enableEditing({onEvent: "mouseover"});
    };
    edit.endPolygonEdit = function () {
      polygon.disableEditing();
    };
    map.addControl(edit);
  });
}
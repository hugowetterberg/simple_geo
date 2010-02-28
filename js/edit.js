// $Id$

/*global google, jQuery, Drupal, GSmallMapControl, GIcon, G_DEFAULT_ICON, GSize, GPoint, GMarker, LookupControl, GEvent, GPolygon */

function EditControl(default_edit_mode, custom_marker_handling) {
  this.default_edit_mode = default_edit_mode;
  this.custom_marker_handling = custom_marker_handling;
}
EditControl.prototype = new GControl();

EditControl.prototype.getDefaultPosition = function () {
  return new GControlPosition(G_ANCHOR_TOP_LEFT, new GSize(60, 0));
};

EditControl.prototype.initialize = function (map, posCallback, polyCallback) {
  var container, control, last_deactivate_callback, last_button;

  container = jQuery('<div class="edit-toolbar"></div>').appendTo(map.getContainer()).get(0);

  this.addButton = function (name, title, callback, deactivate_callback) {
    var button, activate_callback;

    if (!name) {
      jQuery('<div class="spacer">&nbsp;</div>').appendTo(container);
    }
    else {
      button = jQuery('<a class="sg-button ' + name + '" title="' + title + '">' + title + '</a>').appendTo(container);
      activate_callback = function(){
          var activate = true;

          if (last_deactivate_callback) {
            activate = last_deactivate_callback();
          }
          if (activate) {
            jQuery(container)
              .removeClass(last_button + '-active');
          }

          if (activate && callback) {
            activate = callback();
          }
          if (activate) {
            jQuery(container)
              .addClass(name + '-active');
            last_deactivate_callback = deactivate_callback;
            last_button = name;
          }
        };
      if (this.default_edit_mode == name) {
        activate_callback();
      }
      button.click(activate_callback);
    }
  };

  control = this;
  this.container = container;
  return container;
};

if (google && google.load) {
  google.load('maps', '2.x');

  jQuery(document).ready(function () {

    var has_position, has_area, placeholder, map, aCoords, pCoords, position, icon, resetDesc, resetButton, resetBox,
    marker, lookup, edit, color, polygon, polygon_default, i, edit_mode = 'position', no_position = false,
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
    default_position = function (fallback) {
      var def = wkt_to_latlng(Drupal.settings.simple_geo_default_position ? Drupal.settings.simple_geo_default_position : '');
      if (!def && fallback) {
        def = new google.maps.LatLng(55.675455, 12.59119);
      }
      return def;
    },
    editable_polygon = function(poly) {
      var new_poly, i, vert_count, polygon_default, vert = [];

      if (poly) {
        poly.hide();
        vert_count = poly.getVertexCount();
        for (i=0; i<vert_count; i++) {
          vert.push(poly.getVertex(i));
        }
      }
      else {
        //Add existing vertexes.
        vert = polygon_wkt_to_latlng(aCoords);
        console.log(vert);
        vert_count = vert.length;
      }

      //Create the polygon and set it up so that the user can edit it
      color = "#ff0000";
      new_poly = new GPolygon([], color, 2, 0.7, color, 0.2);
      map.addOverlay(new_poly);
      if (vert_count == 0) {
        new_poly.enableDrawing();
      }
      new_poly.enableEditing({onEvent: "mouseover"});

      for (i=0; i<vert_count; i++) {
        new_poly.insertVertex(i, vert[i]);
      }

      //Update the area textarea when the polygon is updated
      //TODO: This should be done on form submit, as it's slightly
      //more expensive than it's position counterpart.
      GEvent.addListener(new_poly, "lineupdated", function () {
        var vCount = this.getVertexCount(), cArray = [], i;
        for (i = 0; i < vCount; i += 1) {
          cArray.push(wkt_coord(this.getVertex(i)));
        }
        jQuery('#edit-simple-geo-area').attr('value', cArray.join(','));
      });

      if (poly) {
        poly.remove();
      }
      return new_poly;
    },
    non_editable_polygon = function(poly) {
      var new_poly, i, vert_count, vert = [];
      poly.hide();
      vert_count = poly.getVertexCount();

      if (vert_count > 0) {
        for (i=0; i<vert_count; i++) {
          vert.push(poly.getVertex(i));
        }

        new_poly = new GPolygon(vert, color, 2, 0.7, color, 0.2, {clickable: false});
        map.addOverlay(new_poly);
      }

      poly.remove();
      return new_poly;
    },
    marker_set_position = function(latlng) {
      if (latlng) {
        marker.setLatLng(latlng);
      }
      marker.show();
      jQuery('#edit-simple-geo-position-wrapper input[type=text]').val(wkt_coord(marker.getLatLng()));
    },
    marker_remove = function() {
      marker.hide();
      jQuery('#edit-simple-geo-position-wrapper input[type=text]').val('');
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
    if (pCoords) {
      position = wkt_to_latlng(pCoords);
    }
    if (!position) {
      no_position = true;
      position = default_position(true);
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
    marker = new GMarker(position, {draggable: true, icon: icon});
    //Add the marker to the map
    if (has_position) {
      map.addOverlay(marker);
    }
    if (no_position) {
      marker_remove();
    }

    lookup = new LookupControl(true);
    map.addControl(lookup);
    jQuery(lookup.container).bind('positioned', function (evt, coord) {
      marker_set_position(coord);
      map.setCenter(coord, Number(Drupal.settings.simple_geo_max_zoom));
    });

    //Update the position text-field on drag end
    GEvent.addListener(marker, "dragend", function () {
      marker_set_position();
    });

    GEvent.addListener(map, "click", function(overlay, latlng) {
      if (edit_mode == 'position') {
        marker_set_position(latlng);
      }
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
              marker_set_position(position);
            }
          }
        );
      }
    });

    edit = new EditControl(edit_mode, true);
    map.addControl(edit);
    if (has_position) {
      edit.addButton('position', Drupal.t('Position'), function () {
        edit_mode = 'position';
        return true;
      });
    }
    if (has_area) {
      edit.addButton('area', Drupal.t('Area'), function () {
        polygon = editable_polygon(polygon);
        edit_mode = 'area';
        return true;
      }, function() {
        polygon = non_editable_polygon(polygon);
        return true;
      });
    }
    edit.addButton();
    if (has_position) {
      edit.addButton('remove_position', Drupal.t('Remove position'), function () {
        edit_mode = '';
        marker_remove();
        no_position = true;
        return false;
      });
    }
    if (has_area) {
      edit.addButton('remove_area', Drupal.t('Remove area'), function () {
        edit_mode = '';
        polygon.remove();
        polygon = null;
        jQuery('#edit-simple-geo-area').attr('value', '');
        return false;
      });
    }
  });
}
// $Id$

/*global google, jQuery, Drupal, GSmallMapControl, GIcon, G_DEFAULT_ICON, GSize, GPoint, LookupControl, GLatLngBounds, GLatLng, GEvent */

if (google && google.load) {
  google.load('maps', '2.x');

  jQuery(document).ready(function () {
    var positions, map_highlight, placeholder, map, icon, tmp_ids, bounds, pos_len, i, lat, lng, pos, marker, default_zoom, default_center, map_state, placeholder_html, micromap_parent, micromap_add_mode;

    positions = jQuery('.geo');

    if (positions.length > 0) {
      placeholder = document.getElementById('micro-map-widget');
      if (!placeholder) {
        placeholder_html = '<div id="micro-map" class="small"><h2 class="title">' + Drupal.t('Map') + '</h2><div id="micro-map-widget"></div>' + '<span class="button" id="micro-map-size"><strong>&lt; ' + Drupal.t('Wider map') + '</strong></span></div>';
        micromap_parent = Drupal.settings.simple_geo_micromap_parent ? Drupal.settings.simple_geo_micromap_parent : '#main-inner';
        micromap_add_mode = Drupal.settings.simple_geo_micromap_add_mode ? Drupal.settings.simple_geo_micromap_add_mode : 'prepend';

        if (micromap_add_mode == 'prepend') {
          jQuery(micromap_parent).prepend(placeholder_html);
        }
        else {
          jQuery(micromap_parent).append(placeholder_html);
        }

        placeholder = document.getElementById('micro-map-widget');
      }
      map = new google.maps.Map2(placeholder);
      map.addControl(new GSmallMapControl());

      icon = new GIcon(G_DEFAULT_ICON);
      if (Drupal.settings.user_map) {
        icon.shadow = null;
        icon.iconSize = new GSize(20, 29);
        icon.iconAnchor = new GPoint(9, 29);
        icon.image = Drupal.settings.user_map.favicon_path + '/default/0/marker.png';
      }

      map.addControl(new LookupControl());

      tmp_ids = 0;
      bounds = new GLatLngBounds();
      pos_len = positions.length;
      for (i = 0; i < pos_len; i += 1) {
        lat = jQuery(positions.get(i)).find('.latitude').text();
        lng = jQuery(positions.get(i)).find('.longitude').text();

        pos = new GLatLng(lat, lng);
        marker = new google.maps.Marker(pos, {'icon' : icon});
        if (i === 0) {
          map.setCenter(pos);
        }

        map.addOverlay(marker);
        GEvent.addListener(marker, "click", function (geo) {
          return function () {
            var level = geo.parentNode, has_title;
            while (!(has_title = jQuery(level).children('.title,.views-field-title').length) && level.parentNode) {
              level = level.parentNode;
            }
            if (!has_title) {
              level = geo.parentNode;
            }
            if (!level.id) {
              level.id = 'micromap-' + (tmp_ids);
              tmp_ids = tmp_ids + 1;
            }
            window.location.hash = '#' + level.id;

            if (map_highlight) {
              jQuery(map_highlight).removeClass('micromap-highlight');
            }
            jQuery(level).addClass('micromap-highlight');
            map_highlight = level;

            jQuery(level).css({ backgroundImage: 'none' }).animate({ backgroundColor: "#FFFFAA" }, 1000, function () {
              jQuery(this).animate({ backgroundColor: "#FFFFFF" }, 1000, function () {
                jQuery(this).css({ backgroundImage: '', backgroundColor: '' });
              });
            });
          };
        }(positions.get(i)));

        jQuery(positions.get(i).parentNode).find('a[rel=map]').click(function (m) {
          return function () {
            map.setCenter(m.getLatLng(), Math.max(map.getZoom(), 14));
          };
        }(marker)).each(function () {
          jQuery(this).attr('href', '#micro-map');
        });

        bounds.extend(pos);
      }

			var max_zoom = Drupal.settings.simple_geo_max_zoom;
      default_zoom = map.getBoundsZoomLevel(bounds) - 1;
			if(max_zoom < default_zoom){
				default_zoom = max_zoom;
			}
      default_center = bounds.getCenter();
      map.setCenter(default_center, Number(default_zoom));

      map_state = 0;
      jQuery('#micro-map-size').click(function () {
        var center = map.getCenter();
        switch (map_state) {
        case 0:
          jQuery(this).find('*').text(Drupal.t('Smaller map') + ' >');
          jQuery('#micro-map').removeClass('small').addClass('large');
          map_state = 1;
          break;
        case 1:
          jQuery(this).find('*').text('< ' + Drupal.t('Wider map'));
          jQuery('#micro-map').addClass('small').removeClass('large');
          map_state = 0;
          break;
        }
        map.checkResize();
        map.setCenter(center);
      });
    }
  });
}

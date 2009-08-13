// $Id$

/*global google, jQuery, Drupal, GSmallMapControl, GIcon, G_DEFAULT_ICON, GSize, GPoint, LookupControl, GLatLngBounds, GLatLng, GEvent */

if (google && google.load) {
  google.load('maps', '2.x');

  jQuery(document).ready(function () {
    var positions, info_window, info_window_content, map_highlight, placeholder, map, icon, tmp_ids, bounds, pos_len, i, lat, lng, pos, marker, default_zoom, default_center, map_state, placeholder_html, micromap_parent, micromap_add_mode;

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
        GEvent.addListener(marker, "click", function (geo, marker) {
          return function () {
            var level = geo, has_title, title;
            while (!(has_title = (title = jQuery(level).children('.simple-geo-title,.title,.views-field-title')).length) && level.parentNode) {
              level = level.parentNode;
            }
            if (!has_title) {
              level = geo.parentNode;
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
            }
            else {
              var pos = map.fromLatLngToContainerPixel(marker.getLatLng());
              info_window_content.empty().append(title.get(0).cloneNode(true));
              var widget_offset = $(placeholder).offset();
              info_window.css({
                'position': 'absolute',
                'top': pos.y + widget_offset.top,
                'left': pos.x + widget_offset.left
              }).show();
            }
          };
        }(positions.get(i), marker));

        jQuery(positions.get(i).parentNode).find('a[rel=map]').click(function (m) {
          return function () {
            map.setCenter(m.getLatLng(), Math.max(map.getZoom(), Drupal.settings.simple_geo_max_zoom));
          };
        }(marker)).each(function () {
          jQuery(this).attr('href', '#micro-map');
        });

        bounds.extend(pos);
      }

      default_zoom = map.getBoundsZoomLevel(bounds);
      if(Drupal.settings.simple_geo_max_zoom < default_zoom){
        default_zoom = Drupal.settings.simple_geo_max_zoom;
      }
      if(Drupal.settings.simple_geo_min_zoom > default_zoom){
        default_zoom = Drupal.settings.simple_geo_min_zoom;
      }
      console.log(default_zoom);
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
        info_window.hide();
      });

      info_window = $('<div id="micro-map-info-window"><div id="micro-map-info-content"></div></div>').appendTo('body');
      info_window.hide();
      info_window_content = $('#micro-map-info-content');
      $('<a class="close_link">' + Drupal.t('Close') + '</a>').appendTo(info_window).click(function(){info_window.hide();});
      GEvent.addListener(map, "movestart", function(){
        info_window.hide();
      });
      GEvent.addListener(map, "click", function(){
        info_window.hide();
      });
    }
  });
}

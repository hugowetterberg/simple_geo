// $Id$

/*global google, Drupal, jQuery, GControl, GControlPosition, G_ANCHOR_TOP_RIGHT, GSize, GIcon, G_DEFAULT_ICON, GPoint, GClientGeocoder */

function LookupControl(custom_marker_handling) {
  this.custom_marker_handling = custom_marker_handling;
}

if (google && google.load) {
  google.load('maps', '2.x');

  jQuery(document).ready(function () {
    LookupControl.prototype = new GControl();

    LookupControl.prototype.getDefaultPosition = function () {
      return new GControlPosition(G_ANCHOR_TOP_RIGHT, new GSize(3, 3));
    };

    LookupControl.prototype.initialize = function (map) {
      var lookup_icon, container, address_input, address_lookup, geocoder, lookup_marker, lookup_string, control, lookup, $fields, lookupOnEnter;

      lookup_icon = new GIcon(G_DEFAULT_ICON);
      lookup_icon.image = 'http://maps.google.com/mapfiles/arrow.png';
      lookup_icon.iconSize = new GSize(39, 34);
      lookup_icon.iconAnchor = new GPoint(11, 33);

      container = jQuery('<div class="address-search"><label for="edit-simple-geo-address-search">' + Drupal.t('Search for address') +
        ': </label><input id="edit-simple-geo-address-search" /></div>').appendTo(map.getContainer()).get(0);
      address_input = jQuery('#edit-simple-geo-address-search');
      address_lookup = jQuery('<a class="">' + Drupal.t('Search') + '</a>').insertAfter(address_input);
      jQuery(container).css({
        'background-color': '#FFFFFF',
        'padding': '2px',
        'border': '1px solid black'
      });

      geocoder = new GClientGeocoder();
      lookup_string = false;
      control = this;
      lookup = function () {
        if (!lookup_string) {
          lookup_string = address_input.val();
        }

        if (Drupal.settings.simple_geo_geocoding_suffix !== undefined) {
          lookup_string += ', ' + Drupal.settings.simple_geo_geocoding_suffix;
        }

        geocoder.getLatLng(lookup_string, function (coord) {
          if (coord) {
            jQuery(container).trigger('positioned', coord);
            if (!control.custom_marker_handling) {
              if (!lookup_marker) {
                lookup_marker = new google.maps.Marker(coord, {'icon' : lookup_icon});
                map.addOverlay(lookup_marker);
              }
              else {
                lookup_marker.setLatLng(coord);
              }
              map.setCenter(coord, Math.max(14, map.getZoom() - 1));
            }
          }
        });

        lookup_string = false;
      };
      address_lookup.click(lookup);

      $fields = jQuery('.simplegeo-address-field');
      $fields.blur(function () {
        lookup_string = '';
        $fields.each(function () {
          lookup_string += jQuery(this).val() + ' ';
        });
        lookup();
      });

      lookupOnEnter = function (event) {
        if (event.keyCode === 13) {
          event.preventDefault();
          lookup();
          return false;
        }
      };

      address_input.keypress(lookupOnEnter);

      this.container = container;
      return container;
    };
  });
}

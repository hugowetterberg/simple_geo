// $Id$

function LookupControl(custom_marker_handling) {
  this.custom_marker_handling = custom_marker_handling;
};

if (google && google.load) {
  google.load('maps', '2.x');
  
  $(document).ready(function(){
    LookupControl.prototype = new GControl();

    LookupControl.prototype.getDefaultPosition = function() {
      return new GControlPosition(G_ANCHOR_TOP_RIGHT, new GSize(3, 3));
    };

    LookupControl.prototype.initialize = function(map) {
      var lookup_icon = new GIcon(G_DEFAULT_ICON);
      lookup_icon.image = 'http://maps.google.com/mapfiles/arrow.png';
      lookup_icon.iconSize = new GSize(39, 34);
      lookup_icon.iconAnchor = new GPoint(11, 33);
  
      var container = $('<div class="address-search"><label for="edit-simple-geo-address-search">' + Drupal.t('Search for address') + 
        ': </label><input id="edit-simple-geo-address-search" /></div>').appendTo(map.getContainer()).get(0);
      var address_input = $('#edit-simple-geo-address-search');
      var address_lookup = $('<a class="">' + Drupal.t('Search') + '</a>').insertAfter(address_input);
      $(container).css({
        'background-color': '#FFFFFF',
        'padding': '2px',
        'border': '1px solid black'
      });

      var geocoder = new GClientGeocoder();
      var lookup_marker;
      var lookup = function(){
        geocoder.getLatLng(address_input.val(), function(coord) {
          if (coord) {
            $(container).trigger('positioned', coord);
            if (!control.custom_marker_handling) {
              if (!lookup_marker) {
                lookup_marker = new google.maps.Marker(coord, {'icon':lookup_icon});
                map.addOverlay(lookup_marker);
              }
              else {
                lookup_marker.setLatLng(coord);
              }
              map.setCenter(coord, Math.max(14, map.getZoom()-1));
            }
          }
        });
      };
      address_lookup.click(lookup);

      var lookupOnEnter = function(event) {
        if (event.keyCode == 13) {
          event.preventDefault();
          lookup();
          return false;
        }
      };

      if ($.browser.mozilla) { 
        address_input.keypress(lookupOnEnter);
      } else {
        address_input.keypress(lookupOnEnter);
      }

      this.container = container;
      return container;
    };
  });
}
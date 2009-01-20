// $Id$

if (google && google.load) {
  google.load('maps', '2.x');
  
  $(document).ready(function(){
    var positions = $('.geo');
    var map_highlight;
    
    if(positions.length>0) {
      var placeholder = document.getElementById('micro-map-widget');
      if (!placeholder) {
        var micro = $('#main-inner').prepend('<div id="micro-map" class="small"><h2 class="title">'+ Drupal.t('Map') 
          +'</h2><div id="micro-map-widget"></div>'
          +'<span class="button" id="micro-map-size"><strong>&lt; '+ Drupal.t('Wider map') +'</strong></span></div>');
        placeholder = document.getElementById('micro-map-widget');
      }
      var map = new google.maps.Map2(placeholder);
      map.addControl(new GSmallMapControl());
      
      var icon = new GIcon(G_DEFAULT_ICON);
      if (Drupal.settings.user_map) {
        icon.shadow = null;
        icon.iconSize = new GSize(20, 29);
        icon.iconAnchor = new GPoint(9, 29);
        icon.image = Drupal.settings.user_map.favicon_path +'/default/0/marker.png';
      }
      
      map.addControl(new LookupControl());
      
      var tmp_ids = 0;
      var bounds = new GLatLngBounds();
      var pos_len = positions.length;
      for (var i=0; i<pos_len; i++) {
        var lat = $(positions.get(i)).find('.latitude').text();
        var lng = $(positions.get(i)).find('.longitude').text();
        
        var pos = new GLatLng(lat,lng);
        var marker = new google.maps.Marker(pos, {'icon':icon});
        if (i==0) {
          map.setCenter(pos);
        }
        
        map.addOverlay(marker);
        GEvent.addListener(marker, "click", function(geo) {
          return function() {
            var level = geo.parentNode;
            while (!(has_title = $(level).children('.title,.views-field-title').length) && level.parentNode) {
              level = level.parentNode;
            }
            if(!has_title) level = geo.parentNode;
            if(!level.id) level.id = 'micromap-'+ (tmp_ids++); 
            window.location.hash = '#'+ level.id;
            
            if (map_highlight) {
              $(map_highlight).removeClass('micromap-highlight');
            }
            $(level).addClass('micromap-highlight');
            map_highlight = level;
            
            $(level).css({ backgroundImage: 'none' }).animate({ backgroundColor: "#FFFFAA" }, 1000, function(){
              $(this).animate({ backgroundColor: "#FFFFFF" }, 1000, function(){
                $(this).css({ backgroundImage: '', backgroundColor: '' });
              });
            });
          };
        }(positions.get(i)));
        
        $(positions.get(i).parentNode).find('a[rel=map]').click(function(m){
          return function() {
            map.setCenter(m.getLatLng(), Math.max(map.getZoom(), 14));
          };
        }(marker)).each(function(){
          $(this).attr('href','#micro-map');
        });
        
        bounds.extend(pos);
      }
      
      var default_zoom = map.getBoundsZoomLevel(bounds)-1;
      var default_center = bounds.getCenter();
      map.setCenter(default_center, default_zoom);
      
      var map_state = 0;
      $('#micro-map-size').click(function(){
        var center = map.getCenter();
        switch (map_state) {
          case 0:
            $(this).find('*').text(Drupal.t('Smaller map') + ' >');
            $('#micro-map').removeClass('small').addClass('large');
            map_state = 1;
          break;
          case 1:
            $(this).find('*').text('< ' + Drupal.t('Wider map'));
            $('#micro-map').addClass('small').removeClass('large');
            map_state = 0;
          break;
        }
        map.checkResize();
        map.setCenter(center);
      });
    }
  });
}

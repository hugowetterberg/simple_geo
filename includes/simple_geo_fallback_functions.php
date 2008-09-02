<?php

function simple_geo_view_position($node) {
  
  drupal_set_title(t('Map for @name', array('@name'=>$node->title)));
  
  if(empty($node->simple_geo_position) && empty($node->simple_geo_area)) {
    drupal_goto('node/'. $node->nid);
  }
  
  $src = 'http://maps.google.com/staticmap?size=400x400&key='. variable_get('gmaps_api_key','');
  if (!empty($node->simple_geo_position)) {
    $src .= '&markers='. simple_geo_custom_separators($node->simple_geo_position,'|',',');
  }
  
  if(!empty($node->simple_geo_area)) {
    if (empty($node->simple_geo_position)) {
      $src .= '&markers=';
    }
    else {
      $src .= '|';
    }
    $src .= simple_geo_custom_separators($node->simple_geo_area,',tinyred|',',') .',tinyred';
    $src .= '&path=rgba:0xff0000ff,weight:5|'. simple_geo_custom_separators($node->simple_geo_area,'|',',');
  }
  
  return '<img src="'. $src .'" width="400" height="400"/>';
}


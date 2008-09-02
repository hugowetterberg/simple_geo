<?php

/**
 * Implementation of hook_theme
 *
 * @return array
 * @author Hugo Wetterberg
 **/
function simple_geo_theme($existing, $type, $theme, $path) {
  return array(
    'geo_meta_tags' => array(
      'arguments' => array('node' => NULL),
    ),
  );
}

/**
 * Theme function that generates html meta tags
 * from the geo data of a node
 * 
 * @param object $node The node to generate meta tags from
 *
 * @return string The meta tags
 * @author Hugo Wetterberg
 **/
function theme_geo_meta_tags($node) {
  if(!isset($node)) {
    return '';
  }
  
  $meta = '';
  if (!empty($node->simple_geo_position)) {
    $c = explode(' ', $node->simple_geo_position);
    $meta .= '<meta name="geo.placename" content="'. check_plain($node->title) .'" />';
    $meta .= '<meta name="icbm" content="'. join(', ', $c) .'" />';
    $meta .= '<meta name="geo.position" content="'. join('; ', $c) .'" />';
  }
  if (!empty($node->simple_geo_area)) {
    $meta .= '<meta name="geo.extent" content="'. $node->simple_geo_area .'" />';
  }
  return $meta;
}
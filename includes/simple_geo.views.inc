<?php
// $Id: simple_geo.views.inc,v 1.1 2010/02/11 08:47:58 hugowetterberg Exp $

/**
 * @file
 * Views interface for simplenews.
 */

/**
 * Implementation of hook_views_data().
 */
function simple_geo_views_data() {
  // Position Fields
  $data['simple_geo_position']['table']['group']  = t('Simple Geo');
  $data['simple_geo_position']['table']['join']['node'] = array(
    'left_field' => 'nid',
    'field' => 'nid',
    'extra' => array(
      array(
        'field' => 'type',
        'value' => 'node',
      ),
    ),
  );
  $data['simple_geo_position']['position'] = array(
    'title' => t('Position'),
    'help' => t('The position of the node.'), // The help that appears on the UI,
    // Information for displaying the nid
    'field' => array(
      'handler' => 'simple_geo_views_handler_field_point',
    ),
    'filter' => array(
      'handler' => 'simple_geo_views_handler_filter_point',
      'label' => t('Has position'),
      'type' => 'yes-no',
      'accept null' => TRUE,
    ),
  );

  return $data;
}

/**
 * Implementation of hook_views_handlers() to register all of the basic handlers
 * views uses.
 */
function simple_geo_views_handlers() {
  return array(
    'info' => array(
      'path' => drupal_get_path('module', 'simple_geo') .'/includes',
    ),
    'handlers' => array(
      // field handlers
      'simple_geo_views_handler_field_point' => array(
        'parent' => 'views_handler_field',
      ),
      'simple_geo_views_handler_filter_point' => array(
        'parent' => 'views_handler_filter',
      ),
    ),
  );
}

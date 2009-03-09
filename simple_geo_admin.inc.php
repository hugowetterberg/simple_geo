<?php
// $Id$

/**
 * @file
 * Admin functions for simple geo
 */

function simple_geo_settings() {
  $form = array();

  $form['position_set'] = array(
    '#type' => 'fieldset',
    '#title' => t('Default position'),
    '#after_build' => array('simple_geo_add_form_js'),
  );

  $form['position_set']['simple_geo_default_position'] = array(
    '#type' => 'textfield',
    '#title' => t('Coordinates'),
    '#default_value' => variable_get('simple_geo_default_position', ''),
    '#prefix' => '<div class="map-placeholder"></div><div id="edit-simple-geo-position-wrapper">',
    '#suffix' => '</div>',
    '#attributes' => array(
      'id' => 'edit-simple-geo-position',
    ),
  );

  $form['simple_geo_geocoding_suffix'] = array(
    '#type' => 'textfield',
    '#default_value' => variable_get('simple_geo_geocoding_suffix', ''),
    '#title' => t('Geocoding suffix'),
    '#description' => t('Any suffix entered here will be appended to the address with a separating comma before a geocoding lookup is performed'),
  );

  $form['simple_geo_show_map_link'] = array(
    '#type' => 'select',
    '#title' => t('Show map links for nodes'),
    '#options' => array(
      'always' => t('Always'),
      'teaser' => t('In teaser'),
      'full' => t('When viewing full node'),
      'never' => t('Never'),
    ),
    '#default_value' => variable_get('simple_geo_show_map_link', 'always'),
  );

  $form['simple_geo_add_microformat_tag'] = array(
    '#type' => 'checkbox',
    '#default_value' => variable_get('simple_geo_add_microformat_tag', 1),
    '#title' => t('Show microformat tag for node positions'),
  );

  $form['simple_geo_use_microformat_map'] = array(
    '#type' => 'checkbox',
    '#default_value' => variable_get('simple_geo_use_microformat_map', 1),
    '#title' => t('Use map to display microformat positions'),
  );

  $form['google'] = array(
    '#type' => 'fieldset',
    '#title' => t('Google maps'),
    '#description' => t('Google Maps must be configured for most of the simple_geo functionality'),
  );

  $form['google']['gmaps_api_key'] = array(
    '#type' => 'textfield',
    '#default_value' => variable_get('gmaps_api_key', ''),
    '#title' => t('Your google maps api key'),
  );

  $form['google']['simple_geo_add_google_jsapi'] = array(
    '#type' => 'checkbox',
    '#default_value' => variable_get('simple_geo_add_google_jsapi', 1),
    '#title' => t('Add the Google AJAX API Loader to the page'),
    '#description' => t('Adds a script tag that loads the Google AJAX API Loader from Google. Disable this if another module or theme already handles this'),
  );

  return system_settings_form($form);
}

<?php
// $Id$

/**
 * @file
 * Handler for a geographical point from simple geo
 */

class simple_geo_views_handler_field_point extends views_handler_field {
  /**
  * Called to add the field to a query.
  */
  function query() {
    $this->ensure_my_table();
    // Add the field.
    $this->field_alias = $this->query->add_field('', 'AsText('. $this->table_alias .'.'. $this->real_field .')', 'simple_geo_point');
    $this->add_additional_fields();
  }

  function add_additional_fields() {
    parent::add_additional_fields();
    $this->additional_fields['nid'] = 'nid';
  }

  function options_form(&$form, &$form_state) {
    parent::options_form($form, $form_state);
    $time = time();

    $form['output_with_map_link'] = array(
      '#type' => 'checkbox',
      '#title' => t('Output with map link'),
      '#default_value' => isset($this->options['output_with_map_link']) && $this->options['output_with_map_link'],
    );

    $form['output_raw'] = array(
      '#type' => 'checkbox',
      '#title' => t('Output raw coordinates'),
      '#default_value' => isset($this->options['output_raw']) && $this->options['output_raw'],
    );
  }

  /**
   * Render the field.
   *
   * @param $values
   *   The values retrieved from the database.
   */
  function render($values) {
    if (!$values->{$this->field_alias}) {
      return;
    }
    $coords = explode(' ', simple_geo_clean_wkt('point', $values->{$this->field_alias}));
    if ($this->options['output_raw']) {
      $output = join($coords, ' ');
    }
    else {
      $output = '<span class="geo"><span class="latitude">' . ((float) $coords[0]) . '</span> <span class="longitude">' . ((float) $coords[1]) . '</span></span>';
      if ($this->options['output_with_map_link']) {
        $output .= l(t('Show on map'), 'node/' . $values->nid . '/map', array(
          'attributes' => array(
            'rel' => 'map',
          ),
        ));
      }
    }
    return $output;
  }
}

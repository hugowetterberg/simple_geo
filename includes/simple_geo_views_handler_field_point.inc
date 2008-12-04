<?php
// $Id: views_handler_field_node.inc,v 1.1 2008/09/03 19:21:29 merlinofchaos Exp $

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
    return '<span class="geo"><span class="latitude">'. ((float) $coords[0]) .'</span> <span class="longitude">'. ((float) $coords[1]) .'</span></span>';
  }
}

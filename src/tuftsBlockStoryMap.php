<?php

namespace Drupal\tufts_blocks\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\Component\Utility\Html;

/**
 * Provides a 'tuftsBlockStoryMap' block.
 *
 * @Block(
 *  id = "tufts_block_story_map",
 *  admin_label = @Translation("Story Map"),
 * )
 */
class tuftsBlockStoryMap extends BlockBase implements ContainerFactoryPluginInterface {

  /**
   * The entity type manager.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;

  /**
   * Constructs a new Story Map instance.
   *
   * @param array $configuration
   *   The plugin configuration, i.e. an array with configuration values keyed
   *   by configuration option name. The special key 'context' may be used to
   *   initialize the defined contexts by setting it to an array of context
   *   values keyed by context names.
   * @param string $plugin_id
   *   The plugin_id for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entity_type_manager
   *   The entity type manager.
   */
  public function __construct(array $configuration, $plugin_id, $plugin_definition, EntityTypeManagerInterface $entity_type_manager) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->entityTypeManager = $entity_type_manager;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('entity_type.manager'),
    );
  }

  /**
   * @param $form
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   * @return array
   */
  public function blockForm($form, FormStateInterface $form_state) {
    $form['story_map_heading'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Heading'),
      '#description' => $this->t('Enter the heading text for this instance of the Story Map.'),
      '#default_value' => $this->configuration['story_map_heading'],
      '#required' => TRUE,
    ];

    $description = !empty($this->configuration['story_map_description']) ? $this->configuration['story_map_description'] : [];
    $form['story_map_description'] = [
      '#type' => 'text_format',
      '#title' => $this->t('Description'),
      '#format' => $description['format'] ?? 'simple_html',
      '#description' => $this->t('Enter the text that will be placed directly under the heading.'),
      '#default_value' => $description['value'] ?? '',
    ];

    return $form;
  }

  /**
   * @param $form
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   * @return void
   */
  public function blockSubmit($form, FormStateInterface $form_state) {
    $this->configuration['story_map_description'] = $form_state->getValue('story_map_description');
    $this->configuration['story_map_heading'] = $form_state->getValue('story_map_heading');
  }

  /**
   * {@inheritdoc}
   */
  public function build() {
    $build = [];
    $map_regions = [];

    // Grab all top-level taxonomy terms for the "Locations" vocabulary.
    // We will also load the actual entities.
    $parent_regions = $this->getTerms();

    foreach ($parent_regions as $parent_region) {
      // Let's first check to make sure that we are only dealing with top-level terms.
      if ($parent_region->parent->target_id == 0) {
        $parent_region_id = $parent_region->id();

        // We will then take the parent's ID and grab all of it's direct children.
        // Again, we want to load the actual entities.
        $child_regions = $this->getTerms('locations', $parent_region_id, 2);

        $child_map_regions = [];

        // Formatting a custom Array for final output of children.
        // Also formatting a custom Array for drupalSettings JavaScript.
        foreach ($child_regions as $child_region) {
          $child_map_regions[] = [
            'id' => $child_region->id(),
            'label' => $child_region->getName(),
            'machine_name' => str_replace('--', '-', Html::getClass($child_region->getName())),
            'x' => $this->getPercent($child_region->get('field_x')->value, $parent_region->get('field_aspect_ratio_x')->value),
            'y' => $this->getPercent($child_region->get('field_y')->value, $parent_region->get('field_aspect_ratio_y')->value),
            'impact' => $child_region->get('field_text_formatted')->view('default'),
            'locations' => $child_region->get('field_locations')->view('default'),
          ];
        }

        // Formatting a custom Array for final output of top-level terms and their children.
        $map_regions[] = [
          'id' => $parent_region_id,
          'label' => $parent_region->getName(),
          'machine_name' => str_replace('--', '-', Html::getClass($parent_region->getName())),
          'x' => $this->getPercent($parent_region->get('field_x')->value, 1304),
          'y' => $this->getPercent($parent_region->get('field_y')->value, 850),
          'aspect_ratio_x' => $parent_region->get('field_aspect_ratio_x')->value,
          'aspect_ratio_y' => $parent_region->get('field_aspect_ratio_y')->value,
          'impact' => $parent_region->get('field_text_formatted')->view('default'),
          'locations' => $parent_region->get('field_locations')->view('default'),
          'regions' => $child_map_regions,
        ];
      }
    }

    if (!empty($this->configuration['story_map_description'])) {
      $build['map_description'] = [
        '#type' => 'processed_text',
        '#text' => $this->configuration['story_map_description']['value'],
        '#format' => $this->configuration['story_map_description']['format'],
      ];
    }

    if (!empty($this->configuration['story_map_heading'])) {
      $build['map_heading'] = $this->configuration['story_map_heading'];
    }

    if (!empty($map_regions)) {
      $build['map_regions'] = $map_regions;
    }

    return $build;
  }

  /**
   * Get the taxonomy terms.
   *
   * @param string $vocab
   *   The vocabulary machine name.
   * @param int $parent
   *   The parent term ID.
   * @param int $depth
   *   The depth of the tree to load.
   * @param bool $load
   *   (optional) Whether to load the terms or not. Defaults to TRUE.
   *
   * @return \Drupal\taxonomy\TermInterface[]
   *   An array of taxonomy terms.
   */
  protected function getTerms($vocab = 'locations', $parent = 0, $depth = 1, $load = TRUE) {
    $storage = $this->entityTypeManager->getStorage('taxonomy_term');
    return $storage->loadTree($vocab, $parent, $depth, $load);
  }

  /**
   * Calculates the percentage of a value relative to a given context.
   *
   * @param float|int $value
   *   The value to calculate the percentage for.
   * @param float|int $context
   *   The context against which the value is calculated.
   *
   * @return float
   *   The calculated percentage. Returns 0 if the value is empty.
   */
  protected function getPercent($value, $context) {
    $percent = 0;

    if (!empty($value)) {
      $percent = round($value / $context * 100, 2);
    }

    return $percent;
  }
}

/**
 * Components - Organism - Story Map
 *
 * - 01 - Story Map
 * - 02 - Drupal Attach
 */


/*------------------------------------*\
  01 - Story Map
\*------------------------------------*/

const storyMap = (wrapper) => {
  // Constructor
  const activeClass = 'is-active';
  const listeners = ['load', 'resize'];
  const mediaQuery = window.matchMedia('(min-width: 1024px)');
  let backTriggers;
  let listTrigger;
  let mapFrame;
  let mapList;
  let mapRegions;
  let mapTrigger;
  let mapWorld;
  let markers;
  let regions;
  let regionContent;
  let state;

  /**
   * Activate Frame
   * Activates the specified element.
   *
   * @function activateFrame
   * @param {string} element - The element to activate. Can be one of: 'list', 'map', or 'regions'.
   * @see onClickListTrigger
   * @see onKeydownListTrigger
   * @see onClickMapTrigger
   * @see onKeydownMapTrigger
   * @see onClickMarker
   * @see onKeydownMarker
   */
  const activateFrame = (element) => {
    if (element === 'world') {
      // 01 - Activate Map Elements
      mapTrigger.classList.add(activeClass);
      mapWorld.classList.add(activeClass);
      mapTrigger.setAttribute('aria-expanded', 'true');

      // 02 - Deactivate List and Region Elements
      mapRegions.classList.remove(activeClass);
      mapList.classList.remove(activeClass);
      listTrigger.classList.remove(activeClass);
      listTrigger.setAttribute('aria-expanded', 'false');
    }

    if (element === 'list') {
      // 01 - Activate List Elements
      listTrigger.classList.add(activeClass);
      listTrigger.setAttribute('aria-expanded', 'true');
      mapList.classList.add(activeClass);

      // 02 - Deactivate Map and Region Elements
      mapTrigger.classList.remove(activeClass);
      mapTrigger.setAttribute('aria-expanded', 'false');
      mapRegions.classList.remove(activeClass);
      mapWorld.classList.remove(activeClass);
    }

    if (element === 'regions') {
      // 01 - Activate Region Elements
      mapRegions.classList.add(activeClass);

      // 02 - Deactive Map and List Elements
      mapTrigger.classList.remove(activeClass);
      mapTrigger.setAttribute('aria-expanded', 'false');
      mapWorld.classList.remove(activeClass);
      mapList.classList.remove(activeClass);
      listTrigger.classList.remove(activeClass);
      listTrigger.setAttribute('aria-expanded', 'false')
    }
  };

  /**
   * Activate Content
   * Activates the content elements associated with the given target element.
   *
   * @function activateContent
   * @param {HTMLElement} target - The target element.
   * @param {boolean} reverse - If this is a back button.
   * @see onClickMarker
   * @see onKeydownMarker
   * @see onKeydownListTrigger
   */
  const activateContent = (target, reverse = false) => {
    if (reverse) {
      // 01 - Determine target content by data attribute
      const previousTarget = target.getAttribute('data-prev-region');
      const previousElement = wrapper.querySelector(`#content-${previousTarget}`);

      // 02 - Activate appropriate content element
      previousElement.classList.add(activeClass);
    } else {
      // 01 - Determine target content by aria-controls
      const controller = target.getAttribute('aria-controls');
      const controllers = controller.split(', '); // Depicts multiple aria-controls

      // 02 - Activate appropriate content element
      controllers.forEach((element) => {
        const control = wrapper.querySelector(`#${element}`);
        control.classList.add(activeClass);
        target.classList.add(activeClass);

        if (!target.classList.contains('o-story-map__region-trigger--listing')) {
          target.setAttribute('aria-expanded', 'true');
        }
      });
    }
  }

  /**
   * Reset Markers and Content
   * Reset the markers content by removing the active class from all markers and content areas.
   *
   * @function resetMarkersContent
   * @see onClickListTrigger
   * @see onClickMapTrigger
   * @see onKeydownMapTrigger
   * @see onClickMarker
   * @see onKeydownMarker
   */
  const resetMarkersContent = () => {
    // 01 - Remove active class from all markers
    markers.forEach((marker) => {
      marker.classList.remove(activeClass);

      if (!marker.classList.contains('o-story-map__region-trigger--listing')) {
        marker.setAttribute('aria-expanded', 'false');
      }

      if (!marker.classList.contains('o-story-map__region-trigger--mobile')) {
        if (state === 'mobile') {
          marker.setAttribute('tabindex', '-1');
          marker.setAttribute('aria-hidden', 'true');
        }

        if (state === 'desktop') {
          marker.removeAttribute('tabindex');
          marker.removeAttribute('aria-hidden')
        }
      }
    });

    // 02 - Remove active class from all content areas
    regionContent.forEach((content) => {
      content.classList.remove(activeClass);
    });
  };

  /**
   * Reset Regions
   * Reset the regions by removing the active class from each region element.
   *
   * @function resetRegions
   * @see onClickListTrigger
   * @see onKeydownListTrigger
   * @see onClickMapTrigger
   * @see onKeydownMapTrigger
   */
  const resetRegions = () => {
    regions.forEach((region) => {
      region.classList.remove(activeClass);
    });
  };

  /**
   * Set Focus
   * Sets focus on the specified target element.
   *
   * @function setFocus
   * @param {HTMLElement} target - The target element to set focus on.
   * @see onKeydownMarker
   * @see onKeydownBackTrigger
   */
  const setFocus = (target) => {
    const focusNext = target.getAttribute('data-next-focus');
    const focusElement = wrapper.querySelector(`#${focusNext}`);

    setTimeout(() => {
      focusElement.focus();
    }, 500);

    focusElement.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  };

  /**
   * Aria Live Update
   * A function that updates the live region in the aria framework.
   *
   * @function ariaLiveUpdate
   * @param {string} text - The text to be translated and announced.
   * @see onClickListTrigger
   */
  const ariaLiveUpdate = (text) => {
    const drupalTranslateText = Drupal.t(text);
    Drupal.announce(drupalTranslateText);
  };

  /**
   * Adjust Height
   * Adjusts the height of the map frame based on the given frame and control parameters.
   *
   * @function adjustHeight
   * @param {string} frame - The type of frame (either 'world' or 'list').
   * @param {HTMLElement} [control] - The control element.
   * @see onClickListTrigger
   * @see onKeydownListTrigger
   * @see onClickMapTrigger
   * @see onKeydownMapTrigger
   * @see onClickMarker
   * @see onKeydownMarker
   * @see onClickBackTrigger
   * @see onKeydownBackTrigger
   * @see onMediaQueryChange
   * @see onResizeLoadHeightAdjust
   */
  const adjustHeight = (frame, control) => {
    let additionalHeight = 0;
    let totalHeight = 0;

    if (frame === 'world') {
      const mapWrapper = mapWorld.querySelector('.o-story-map__world-map-wrapper');

      if (state === 'mobile') {
        const mobileNav = mapWorld.querySelector('.o-story-map__mobile-navigation');
        additionalHeight = 40;

        // 01 - Add height of selected elements
        totalHeight = Number(mapWrapper.offsetHeight) + Number(mobileNav.offsetHeight);

        // 02 - Apply the total height of elements to the frame's block size
        mapFrame.style.blockSize = `${totalHeight + additionalHeight}px`;
      }

      if (state === 'desktop') {
        additionalHeight = 8;

        // 01 - Add height of selected elements
        totalHeight = Number(mapWrapper.offsetHeight);

        // 02 - Apply the total height of elements to the frame's block size
        mapFrame.style.blockSize = `${totalHeight - additionalHeight}px`;
      }
    }

    if (frame === 'list') {
      // 01 - Add height of selected elements
      totalHeight = Number(mapList.offsetHeight);

      // 02 - Apply the total height of elements to the frame's block size
      mapFrame.style.blockSize = `${totalHeight}px`;
    }

    if (control && frame === 'regions') {
      const controller = control.getAttribute('aria-controls');
      const controllers = controller.split(', '); // Depicts multiple aria-controls

      if (state === 'mobile') {
        additionalHeight = 240;

        controllers.forEach((element) => {
          const controlled = wrapper.querySelector(`#${element}`);

          if (controlled.classList.contains('o-story-map__region')) {
            const mapWrapper = controlled.querySelector('.o-story-map__region-map-wrapper');

            // 01 - Add height of selected elements
            totalHeight += Number(mapWrapper.offsetHeight);
          }

          if (controlled.classList.contains('o-story-map__region-content')) {
            // 01 - Add height of selected elements
            totalHeight += Number(controlled.offsetHeight);
          }

          if (controlled.querySelector('.o-story-map__mobile-navigation')) {
            const mobileNav = controlled.querySelector('.o-story-map__mobile-navigation');

            // 01 - Add height of selected elements
            totalHeight += Number(mobileNav.offsetHeight);
          }

          // 02 - Apply the total height of elements to the frame's block size
          mapFrame.style.blockSize = `${totalHeight + additionalHeight}px`;
        });
      }

      if (state === 'desktop') {
        additionalHeight = 160;
        let mapWrapperHeight = 0;
        let contentWrapperHeight = 0;

        controllers.forEach((element) => {
          const controlled = wrapper.querySelector(`#${element}`);

          if (controlled.classList.contains('o-story-map__region')) {
            const mapWrapper = controlled.querySelector('.o-story-map__region-map-wrapper');
            mapWrapperHeight = Number(mapWrapper.offsetHeight);
          }

          if (controlled.classList.contains('o-story-map__region-content')) {
            contentWrapperHeight = Number(controlled.offsetHeight);
          }

          // 01 - Add height of selected elements
          if (mapWrapperHeight > contentWrapperHeight) {
            totalHeight = mapWrapperHeight;
          }

          // 01 - Add height of selected elements
          if (mapWrapperHeight < contentWrapperHeight) {
            totalHeight = contentWrapperHeight;
          }

          // 02 - Apply the total height of elements to the frame's block size
          mapFrame.style.blockSize = `${totalHeight + additionalHeight}px`;
        });
      }
    }

    if (!control && frame === 'regions') {
      if (state === 'mobile') {
        additionalHeight = 240;
        const mapWrapper = mapRegions.querySelector(`.o-story-map__region.${activeClass} .o-story-map__region-map-wrapper`);
        const contentWrapper = mapRegions.querySelector(`.o-story-map__region.${activeClass} .o-story-map__region-content.${activeClass}`);
        const mobileNav = mapRegions.querySelector(`.o-story-map__region.${activeClass} .o-story-map__mobile-navigation`);

        // 01 - Add height of selected elements
        totalHeight += Number(mapWrapper.offsetHeight) + Number(contentWrapper.offsetHeight) + Number(mobileNav.offsetHeight);

        // 02 - Apply the total height of elements to the frame's block size
        mapFrame.style.blockSize = `${totalHeight + additionalHeight}px`;
      }

      if (state === 'desktop') {
        additionalHeight = 150;
        const mapWrapper = mapRegions.querySelector(`.o-story-map__region.${activeClass} .o-story-map__region-map-wrapper`);
        const contentWrapper = mapRegions.querySelector(`.o-story-map__region.${activeClass} .o-story-map__region-content.${activeClass}`);

        // 01 - Add height of selected elements
        if (Number(mapWrapper.offsetHeight) > Number(contentWrapper.offsetHeight)) {
          totalHeight = Number(mapWrapper.offsetHeight);
        }

        // 01 - Add height of selected elements
        if (Number(mapWrapper.offsetHeight) < Number(contentWrapper.offsetHeight)) {
          totalHeight = Number(contentWrapper.offsetHeight);
        }

        // 02 - Apply the total height of elements to the frame's block size
        mapFrame.style.blockSize = `${totalHeight + additionalHeight}px`;
      }
    }
  };

  /**
   * On Click - List Trigger
   * Function called when the list trigger is clicked.
   *
   * @function onClickListTrigger
   * @param {Event} event - The click event object.
   * @see init
   */
  const onClickListTrigger = (event) => {
    // 01 - Reset all map elements to not active
    resetMarkersContent();

    // 02 - Remove active class from all regions
    resetRegions();

    // 03 - Set the List as active and all other frames as not.
    activateFrame('list');

    // 04 - Adjust height of component frame
    adjustHeight('list', null);

    // 05 - Aria Live announcement
    ariaLiveUpdate('Now viewing list of regions');
  };

  /**
   * On Keydown - List Trigger
   * Handles the keydown event on a trigger element.
   *
   * @function onKeydownListTrigger
   * @param {Event} event - The keydown event object.
   * @see init
   */
  const onKeydownListTrigger = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();

      // 01 - Reset all map elements to not active
      resetMarkersContent();

      // 02 - Remove active class from all regions
      resetRegions();

      // 03 - Set the List as active and all other frames as not.
      activateFrame('list');

      // 04 - Adjust height of component frame
      adjustHeight('list', null);

      // 05 - Aria Live announcement
      ariaLiveUpdate('Now viewing list of regions');
    }
  };

  /**
   * On Click - Map Trigger
   * Triggers the onClick event for the map.
   *
   * @function onClickMapTrigger
   * @param {Event} event - The event object triggered by the click.
   * @see init
   */
  const onClickMapTrigger = (event) => {
    // 01 - Reset all map elements to not active
    resetMarkersContent();

    // 02 - Remove active class from all regions
    resetRegions();

    // 03 - Set the World map as active and all other frames as not.
    activateFrame('world');

    // 04 - Adjust height of component frame
    adjustHeight('world', null);

    // 04 - Aria Live announcement
    ariaLiveUpdate('Now viewing the world map');
  };

  /**
   * On Keydown - Map Trigger
   * Function triggered when a keydown event occurs.
   * Resets map elements, removes active class from regions, and activates the list frame.
   *
   * @function onKeydownMapTrigger
   * @param {Event} event - The keydown event object.
   * @see init
   */
  const onKeydownMapTrigger = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();

      // 01 - Reset all map elements to not active
      resetMarkersContent();

      // 02 - Remove active class from all regions
      resetRegions();

      // 03 - Set the List as active and all other frames as not.
      activateFrame('world');

      // 04 - Adjust height of component frame
      adjustHeight('world', null);

      // 05 - Aria Live announcement
      ariaLiveUpdate('Now viewing the world map');
    }
  };

  /**
   * On Click - Marker
   * Activates regions on the World map, resets all map elements to not active,
   * and adds active class to current marker and content area.
   *
   * @function onClickMarker
   * @param {Event} event - The event object triggered by the onClick event.
   * @see init
   */
  const onClickMarker = (event) => {
    // 01 - If the World map is active, deactivate, and set Regions as active.
    activateFrame('regions');

    // 02 - Reset all map elements to not active
    resetMarkersContent();

    // 03 - Add active class to current marker and content area signified by each aria-control
    activateContent(event.currentTarget);

    // 04 - Adjust height of component frame
    adjustHeight('regions', event.currentTarget);

    // 05 - Set focus to inner link
    setFocus(event.currentTarget);

    // 06 - Aria Live announcement
    ariaLiveUpdate(`Now viewing the ${event.currentTarget.textContent} region`);
  };

  /**
   * On Keydown - Marker
   * Handles the keydown event for a marker element.
   *
   * @function onKeydownMarker
   * @param {Event} event - The keydown event.
   * @see init
   */
  const onKeydownMarker = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();

      // 01 - If the World map is active, deactivate, and set Regions as active.
      activateFrame('regions');

      // 02 - Reset all map elements to not active
      resetMarkersContent();

      // 03 - Add active class to current marker and content area signified by each aria-control
      activateContent(event.currentTarget);

      // 04 - Adjust height of component frame
      adjustHeight('regions', event.currentTarget);

      // 05 - Set focus to inner link
      setFocus(event.currentTarget);

      // 06 - Aria Live announcement
      ariaLiveUpdate(`Now viewing the ${event.currentTarget.textContent} region`);
    }
  };

  /**
   * On Click - Back Trigger
   * Resets markers and content to not active and activates the parent region.
   *
   * @function onClickBackTrigger
   * @param {Event} event - The click event.
   * @see init
   */
  const onClickBackTrigger = (event) => {
    // If region back button, else back to world
    if (event.currentTarget.getAttribute('data-prev-region')) {
      // 01 - Reset markers and content to not active
      resetMarkersContent();

      // 02 - Set the Parent region as active
      activateContent(event.currentTarget, true);

      // 03 - Adjust height of component frame
      adjustHeight('regions', event.currentTarget);

      // 04 - Set focus to region map
      setFocus(event.currentTarget);

      // 05 - Aria Live announcement
      ariaLiveUpdate(`Now viewing the ${event.currentTarget.getAttribute('data-announce')} region`);
    } else {
      // 01 - Reset all map elements to not active
      resetMarkersContent();

      // 02 - Remove active class from all regions
      resetRegions();

      // 03 - Set the World map as active and all other frames as not.
      activateFrame('world');

      // 04 - Adjust height of component frame
      adjustHeight('world', null);

      // 05 - Set focus to region map
      setFocus(event.currentTarget);

      // 06 - Aria Live announcement
      ariaLiveUpdate('Now viewing the world map');
    }
  };

  /**
   * On Keydown - Back Trigger
   * Function triggered when the backspace key is pressed down.
   *
   * @function onKeydownBackTrigger
   * @param {Event} event - The keyboard event object.
   * @see init
   */
  const onKeydownBackTrigger = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();

      // If region back button, else back to world
      if (event.currentTarget.getAttribute('data-prev-region')) {
        // 01 - Reset markers and content to not active
        resetMarkersContent();

        // 02 - Set the Parent region as active
        activateContent(event.currentTarget, true);

        // 03 - Adjust height of component frame
        adjustHeight('regions', event.currentTarget);

        // 04 - Set focus to region map
        setFocus(event.currentTarget);

        // 04 - Aria Live announcement
        ariaLiveUpdate(`Now viewing the ${event.currentTarget.getAttribute('data-announce')} region`);
      } else {
        // 01 - Reset all map elements to not active
        resetMarkersContent();

        // 02 - Remove active class from all regions
        resetRegions();

        // 03 - Set the World map as active and all other frames as not.
        activateFrame('world');

        // 04 - Adjust height of component frame
        adjustHeight('world', null);

        // 05 - Set focus to world map
        setFocus(event.currentTarget);

        // 06 - Aria Live announcement
        ariaLiveUpdate('Now viewing the world map');
      }
    }
  };

  /**
   * Media Query Change
   * Handles changes to the media query by updating the state and performing necessary actions.
   *
   * @function onMediaQueryChange
   * @see init
   */
  const onMediaQueryChange = () => {
    if (mediaQuery.matches) {
      state = 'desktop';
    } else {
      state = 'mobile';
    }

    // 01 - Reset markers and content to not active
    resetMarkersContent();

    // 02 - Remove active class from all regions
    resetRegions();

    // 03 - Set the World map as active and all other frames as not.
    activateFrame('world');

    // 04 - Adjust height of component frame
    adjustHeight('world', null);

    // 05 - Aria Live announcement
    ariaLiveUpdate('Now viewing the world map');
  };

  /**
   * Resize / Load Height Adjust
   * Adjusts the height of elements on resize for the load function.
   * Elements with the 'activeClass' will have their height adjusted.
   *
   * @function onResizeLoadHeightAdjust
   * @see init
   */
  const onResizeLoadHeightAdjust = () => {
    if (mapWorld.classList.contains(activeClass)) {
      adjustHeight('world', null);
    }

    if (mapRegions.classList.contains(activeClass)) {
      adjustHeight('regions', null)
    }

    if (mapList.classList.contains(activeClass)) {
      adjustHeight('list', null);
    }
  }

  /**
   * Initialization
   * Add any and all functionality as a singular program, dynamically setting
   * element variables, states and event listeners.
   * @param wrapper - [HTMLObject] Element that contains all elements contained
   * inside the eventual modal.
   */
  const init = (wrapper) => {
    backTriggers = wrapper.querySelectorAll('.o-story-map__back-trigger');
    listTrigger = wrapper.querySelector('.o-story-map__list-view-trigger');
    mapFrame = wrapper.querySelector('.o-story-map__frame');
    mapList = wrapper.querySelector('.o-story-map__list');
    mapRegions = wrapper.querySelector('.o-story-map__regions');
    mapTrigger = wrapper.querySelector('.o-story-map__map-view-trigger');
    mapWorld = wrapper.querySelector('.o-story-map__world');
    markers = wrapper.querySelectorAll('.o-story-map__region-trigger');
    regions = wrapper.querySelectorAll('.o-story-map__region');
    regionContent = wrapper.querySelectorAll('.o-story-map__region-content');

    listTrigger.addEventListener('click', onClickListTrigger);
    listTrigger.addEventListener('keydown', onKeydownListTrigger);
    mapTrigger.addEventListener('click', onClickMapTrigger);
    mapTrigger.addEventListener('keydown', onKeydownMapTrigger);

    markers.forEach((marker) => {
      marker.addEventListener('click', onClickMarker);
      marker.addEventListener('keydown', onKeydownMarker);
    });

    backTriggers.forEach((trigger) => {
      trigger.addEventListener('click', onClickBackTrigger);
      trigger.addEventListener('keydown', onKeydownBackTrigger);
    });

    mediaQuery.addEventListener('change', onMediaQueryChange);
    onMediaQueryChange();

    listeners.forEach((listener) => {
      window.addEventListener(listener, onResizeLoadHeightAdjust)
    });
  };

  // Final Return
  init(wrapper);
};




/*------------------------------------*\
  02 - Drupal Attach
\*------------------------------------*/

Drupal.behaviors.tuftsStoryMap = {
  attach(context) {
    const maps = once('tufts-story-map', context.querySelectorAll('.o-story-map'));

    if (maps.length !== 0) {
      maps.forEach((map) => storyMap(map));
    }
  },
};

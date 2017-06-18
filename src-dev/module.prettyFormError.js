// @flow
/* global IprettyError */

/** Global factory for PrettyFormError
 *  using vanilla JS
 * @returns {Function} init(element, options)
 */
function PrettyFormError() {
  /**
   * Assignement a default value and checking valid one for positionMethod prop
   * @param {string} [userValue='afterend'] user value
   * @returns {string} value for positionMethod prop
   */
  function _valuePositonChecker( userValue: string  = 'afterend' ): string {
    const notFound = [ 'beforebegin', 'afterend' ].indexOf( userValue.toLowerCase()) === -1;

    if ( notFound ) {
      console.warn( 'positionMethod prop value should be "beforebegin" or "afterend", a default "afterend" value has been assigned' );
    }
    return notFound ?
      'afterend' :
      userValue.toLowerCase();
  }

  /** Setting defualt properties values if user
   *  doesn't specify them
   * @param {IprettyError} options Object implementing IprettyError
   * @returns {void}
   */
  function _setOpts( options: IprettyError ): IprettyError {
    const tempFadeOpt = {fadeOut: false, fadeOutOpts: ''};
    const tempMulti = {enabled: false, selector: '.multiCheckbox'};
    const callToAction = options.callToAction || 'button';
    const elementError = options.elementError || 'div';
    const classError = options.classError || 'prettyFormError';
    const positionMethod = _valuePositonChecker( options.positionMethod );
    const focusErrorOnClick = options.focusErrorOnClick || true;
    const fadeOutError = options.fadeOutError || tempFadeOpt;
    const multiCheckbox = options.multiCheckbox || tempMulti;

    return {
      callToAction,
      elementError,
      classError,
      positionMethod,
      focusErrorOnClick,
      fadeOutError,
      multiCheckbox
    };
  }

  /** Converts actual element into array
   * @param {HTMLElement} element Element/s selected by user
   * @returns {Array<HTMLElement>} Elements into an array
   */
  function _convertToArray( element ): Array<HTMLElement> {
    return ( element instanceof Element ) ?
      [element] :
      element;
  }


  /** Romoves old errors displayed in screen
   * @param {EventTarget} element Current form that is validated
   * @param {string} cssSelector css class name to serach and delete
   * @return {void}
   */
  function _removeOldErrors( element: HTMLElement, cssSelector: string ): void {
    if ( element ) {
      const oldErrors = element.querySelectorAll( `.${cssSelector}` );
      [].forEach.call( oldErrors, ( error: HTMLElement ) => {
        error.remove();
      });
    }
  }

  /**
   * Creates HTML to hold the error for all invalid inputs
   * @param {NodeList<HTMLElement>} invalids Invalid inputs for actual submited form
   * @param {string} element User or default element defined for error
   * @param {string} classError User or default css class for error
   * @param {string} positionMethod User or default css class for error
   * @return {void}
   */
  function _createErrorElement(
    invalids: NodeList<HTMLElement>,
    element: string,
    classError: string,
    positionMethod: 'beforebegin' | 'afterbegin' | 'beforeend' | 'afterend'
  ): void {
    [].forEach.call( invalids, ( invalid: HTMLInputElement ) => {
      const tempElem = document.createElement( element );
      tempElem.textContent = invalid.validationMessage;
      tempElem.classList.add( `${classError}` );
      invalid.insertAdjacentElement( positionMethod, tempElem );
    });
  }

  /**
   * Applies click handler for collection
   * @param {*} elements Array of HTMLElements
   * @param {*} options User options or defaults
   * @return {void}
   */
  function _clickHandlerNodeList( elements: any, options: any ): void {
    for ( let i = 0; i < elements.length; i++ ) {
      _onClickHandler( elements[ i ], options );
    }
  }

  /**
   * Set inputs values as empty string for those that are valid
   * @param {NodeList<HTMLElement>} valids Valids inputs when form is submitted
   * @return {void}
   */
  function _clearValidInputs( valids: NodeList<HTMLElement> ): void {
    [].forEach.call( valids, ( valid: HTMLInputElement ) => {
      valid.value = '';
    });
  }

  /**
   * Adds CSS class with animation so error can fadeout
   * @returns {MutationObserver} mutation observer constructor
   */
  function _fadeOutErrorConfig(): MutationObserver {
    return new MutationObserver( mutations => {
      mutations.forEach( mutation => {
        if ( mutation.addedNodes.length > 0 ) {
          ( mutation.addedNodes[ 0 ]: any ).classList.add( 'prettyFormError-fade' );
        }
      });
    });
  }

  /**
   * setup for multi checkboxes that needs validation
   * @param {string} cssSelector common css selector for all checkboxes
   * @returns {void}
   */
  function _multiCheckboxConfig( cssSelector: string ) {
    const checkboxes = document.querySelectorAll( cssSelector );

    function changeHandler() {
      const checkedCount = document.querySelectorAll( `${cssSelector}:checked` ).length;

      if ( checkedCount > 0 ) {
        for ( let i = 0; i < checkboxes.length; i++ ) {
          checkboxes[ i ].removeAttribute( 'required' );
        }
      } else {
        for ( let i = 0; i < checkboxes.length; i++ ) {
          checkboxes[ i ].setAttribute( 'required', 'required' );
        }
      }
    }

    [].forEach.call( checkboxes, input => {
      input.addEventListener( 'change', changeHandler );
    });
  }

  /**
   * Append click event for element within the form
   * @param {HTMLElement} element form element to apply
   * @param {*} options User options or defaults
   * @return {void}
   */
  function _onClickHandler( element: HTMLElement, options: any ): void {
    const button: ?HTMLElement = element.querySelector( `${options.callToAction}` );

    if ( button ) {
      button.addEventListener( 'click', ( event: MouseEvent ) => {
        event.preventDefault();
        const invalids = element.querySelectorAll( ':invalid' );
        const valids = element.querySelectorAll( ':valid' );

        // removing old errors
        if ( !options.fadeOutError.fadeOut && document.querySelector( `.${options.classError}` )) {
          _removeOldErrors( element,  options.classError );
        }
        // fading old errors
        if ( options.fadeOutError.fadeOut ) {
          let observer = _fadeOutErrorConfig();
          const config = { attributes: true, childList: true, characterData: true };
          observer.observe( element, config );

          setTimeout(() => {
            _removeOldErrors( element,  options.classError );
          }, 6200 );

          // clearing observer
          if ( invalids.length === 0 && valids.length > 0 ) {
            observer.disconnect();
            observer = null;
          }
        }

        // adding new errors
        if ( invalids.length > 0 ) {
          _createErrorElement(
            invalids,
            options.elementError,
            options.classError,
            options.positionMethod
          );
        }

        // clearing valid inputs
        if ( invalids.length === 0 && valids.length > 0 ) {
          _clearValidInputs( valids );
        }

        // focusing on first errrored input
        if ( invalids.length > 0 && options.focusErrorOnClick ) {
          invalids[ 0 ].focus();
        }

        // multiCheckbox configuration
        if ( options.multiCheckbox.enabled ) {
          _multiCheckboxConfig( options.multiCheckbox.selector );
        }
      });
    }
  }

  return {
    init: (
      element,
      options: IprettyError | Object = {}
 ) => {
      const isHTMLElement = element instanceof Element ||
        element instanceof NodeList ||
        element instanceof HTMLCollection;
      let tempElem;

      // seting default element for empty case
      isHTMLElement ?
        tempElem = _convertToArray( element ) :
        tempElem = document.querySelectorAll( 'form' );

      // seting user props or default
      // and adding click handler
      _clickHandlerNodeList( tempElem, _setOpts( options ));
    }
  };
}

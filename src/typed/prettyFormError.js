/* dev-code */
/* @flow */
/* global IprettyError Positions */
/* end-dev-code */
function _optionsConfig( opts: any ): IprettyError {
  var innerOpts = opts || {};
  var positionMethod;
  var classError = innerOpts.classError || 'prettyFormError';
  var callToAction = innerOpts.callToAction || 'button';
  var elementError = innerOpts.elementError || 'div';
  var focusErrorOnClick = innerOpts.focusErrorOnClick || true;
  var tempFadeOpt = {fadeOut: false, fadeOutOpts: ''};
  var tempMulti = {enabled: false, selector: '.multiCheckbox'};
  var fadeOutError = innerOpts.fadeOutError || tempFadeOpt;
  var multiCheckbox = innerOpts.multiCheckbox || tempMulti;
  if ( 'positionMethod' in innerOpts ) {
    positionMethod = innerOpts.positionMethod  === 'after' ? 'afterend' : 'beforebegin';
  } else {
    positionMethod = innerOpts.positionMethod  = 'afterend';
  }

  return {
    classError: classError,
    elementError: elementError,
    positionMethod: positionMethod,
    multiCheckbox: multiCheckbox,
    callToAction: callToAction,
    focusErrorOnClick: focusErrorOnClick,
    fadeOutError: fadeOutError
  };
}


function PrettyFormErrorInstance( selector: string, opts: IprettyError ): void {
  var options: IprettyError = _optionsConfig( opts );

  function _removeOldErrors( element: HTMLElement ) {
    if ( element ) {
      var oldErrors = element.querySelectorAll( '.' + options.classError );
      [].forEach.call( oldErrors, function( error ) {
        error.remove();
      });
    }
  }

  function _createErrorElement(
    elemToAppend: HTMLInputElement,
    positionMethod: Positions
  ) {
    var div = document.createElement( 'div' );
    div.classList.add( options.classError );
    div.textContent = elemToAppend.validationMessage;
    elemToAppend.insertAdjacentElement( positionMethod, div );
  }

  function _clickHandler( elem: HTMLElement ) {
    var invalids = elem.querySelectorAll( ':invalid' );
    var caller = elem.querySelector( 'button' );
    if ( caller ) {
      caller.onclick = function() {
        // Deleting old errors
        if ( document.querySelector( '.' + options.classError )) {
          _removeOldErrors( elem );
        }
        [].forEach.call( invalids, function ( invalid: HTMLInputElement ) {
          _createErrorElement(
            invalid,
            options.positionMethod
          );
        });
      };
    }
  }

  if ( typeof jQuery === 'undefined' ) {
    var elem = document.querySelectorAll( selector );
    [].forEach.call( elem, function( element ) {
      _clickHandler( element );
    });
  } else {
    $.each( $( selector ), function ( index, item ) {
      _clickHandler( item );
    });
  }
}

function prettyFormError( elem: string, options: IprettyError ): PrettyFormErrorInstance {
  return new PrettyFormErrorInstance( elem, options );
}

if ( typeof jQuery !== 'undefined' ) {
  $.fn.prettyFormError = function( options ) {
    var pluginName = 'prettyFormError';
    var dataKey = 'plugin_' + pluginName;
    return this.each( function() {
      if ( !$.data( this, dataKey )) {
        $.data( this, dataKey, prettyFormError( this, options ));
      }
    });
  };
}

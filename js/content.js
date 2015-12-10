( function( globalContext ) {
    "use strict";

    const fetchKeyword = "fetch->dom";

    function equal( firstItem, secondItem ) {
        return firstItem === secondItem;
    }

    class Messenger {
        static handleInputMessage( message, sender, response ) {
            if ( equal( message, fetchKeyword ) )
                response( document.all[ 0 ].outerHTML );
        }
    }

    chrome.runtime.onMessage.addListener(
        Messenger.handleInputMessage
    );

})( window );
( function( globalContext, extensionName ) {
    "use strict";

    let extensionContext = new Object();

    function equal( firstItem, secondItem ) {
        return firstItem === secondItem;
    }
 
    function assert( condition, message ) {
        if ( equal( condition, "boolean" ) )
            throw new Error( "Can't handle the assertion, because the given condition is NOT a type of `boolean`." );
 
        if ( equal( message, "string" ) )
            throw new Error( "Can't handle the assertion, because the given message is NOT a type of `string`." );
 
        if ( !condition )
            throw new Error( message );
    }

    function allocateCallstack( method, milliseconds ) {
        assert( equal( typeof method, "function" ),
            "Can't run the given method under the new call stack, because it's NOT a type of `function`."
        );

        if ( !milliseconds )
            milliseconds = 0;

        globalContext.setTimeout( method, milliseconds );
    }

    function async( generator ) {
        let iterator = generator();
        let proxy = null;

        ( function iterate( value ) {
            proxy = iterator.next( value );

            if ( !proxy.done ) {
                if ( "then" in proxy.value )
                    proxy.value.then( iterate );
                else {
                    allocateCallstack( function() {
                        iterate( proxy.value );
                    });
                }
            }
        })();
    }

    ( function( WalkMe ) {

        const validReadyState = 4;
        const httpOkStatus = 200;

        class Web {
            static sendRequest( url ) {
                return new Promise( function( resolve, reject ) {
                    handleWebRequest.call({
                        resolve : resolve,
                        reject  : reject
                    }, url );
                });
            }
        }

        function handleWebRequest( url ) {
            assert( equal( typeof url, "string" ),
                "Can't handle the web-request, because the given url is NOT a type of `string`."
            );

            let self = this;
            let request = new Request( url );

            fetch( request ).then( function( response ) {
                response.blob().then( function( binaryData ) {
                    let reader = new FileReader();
                    reader.onload = function( event ) {
                        ( equal( typeof this.result, "string" ) )
                            ? self.resolve( this.result )
                            : self.reject( new Error( "Failed to fetch required data." ) );
                    };

                    reader.readAsText( binaryData );
                });
            });
        }

        WalkMe.Web = Web;

    })( extensionContext );

    ( function( WalkMe ) {

        let $userId       = Symbol( "$UrlData::UserId" );
        let $environment  = Symbol( "$UrlData::Environment" );
        let $hostname     = Symbol( "$UrlData::Hostname" );
        let $secureState  = Symbol( "$UrlData::SecureState" );
        let $asyncState   = Symbol( "$UrlData::AsyncState" );

        class UrlData {
            constructor( args ) {
                this.handleInputArguments( args );
            }

            handleInputArguments( args ) {
                for ( const item in args ) {
                    switch ( item ) {
                        case "userId":
                            assert( equal( typeof args[ item ], "string" ),
                                "The given user id is NOT a type of `string`."
                            );

                            this[ $userId ] = args[ item ];
                            break;
                        case "environment":
                            assert( equal( typeof args[ item ], "string" ),
                                "The given environment is NOT a type of `string`."
                            );

                            this[ $environment ] = args[ item ];
                            break;
                        case "hostname":
                            assert( equal( typeof args[ item ], "string" ),
                                "The given hostname is NOT a type of `string`."
                            );

                            this[ $hostname ] = args[ item ];
                            break;
                        case "https":
                            assert( equal( typeof args[ item ], "boolean" ),
                                "The given secure state is NOT a type of `boolean`."
                            );

                            this[ $secureState ] = args[ item ];
                            break;
                        case "async":
                            assert( equal( typeof args[ item ], "boolean" ),
                                "The given secure state is NOT a type of `boolean`."
                            );

                            this[ $asyncState ] = args[ item ];
                            break;
                        default:
                            throw new Error( "Invalid property for the new `UrlData` object." );
                    }
                }
            }

            get userId() {
                return this[ $userId ];
            }

            get environment() {
                return this[ $environment ];
            }

            get hostname() {
                return this[ $hostname ];
            }

            get isSecure() {
                return this[ $secureState ];
            }

            get isAsync() {
                return this[ $asyncState ];
            }
        }

        class Models {
            static UrlData( args ) {
                return new UrlData( args );
            }
        }

        WalkMe.Models = Models;

    })( extensionContext );

    ( function( WalkMe ) {

        const regexUrl       = /(\b(https?):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|]settings\.txt)/gim;
        const regexFile      = /fixedCallback\(([\s\S]+)\);$/gi;
        const regexReplace   = /\'/g;

        const throbberDomId  = "throbber";
        const containerDomId = "container-result";
        const urlPrefix      = "walkme.com";
        const fetchKeyword   = "fetch->dom";
        const htmlTemplate   = "\
            www.walkme.com - WalkMe enabled<br>\
            User Id - {0}<br>\
            Env - {1}<br>\
            Is HTTPS - {2}<br>\
            Host - {3}<br>\
            async - {4}<br>\
        ";

        class PageHandler {
            printNullablePage() {
                let container = document.getElementById( containerDomId );
                container.innerText = "www.walkme.com - Doesn't contain the walkme code.";
            }

            printResultPage( data ) {
                assert( data instanceof Set, "Can't print the result page, because the given set is NOT an instance of `Set`." );

                data.forEach( item => {
                    let content = htmlTemplate
                    .replace( "{0}", item.userId )
                    .replace( "{1}", item.environment )
                    .replace( "{2}", item.isSecure )
                    .replace( "{3}", item.hostname )
                    .replace( "{4}", item.isAsync );

                    let container = document.getElementById( containerDomId );
                    container.innerHTML = content;
                });
            }

            printAdditionalInfo( data ) {
                if ( equal( typeof data, "object" ) ) {
                    if ( equal( typeof data.libFile, "string" ) )
                        this.printLibraryFileInfo( data.libFile );

                    if ( equal( typeof data.DataFiles, "object" ) ) {
                        let info = data.DataFiles[ 0 ];

                        if ( equal( typeof info, "object" ) ) {
                            this.printDataFilesUrl( info.url );
                            this.printLanguagesInfo( info.languages );
                        }
                    }
                }
            }

            printLibraryFileInfo( data ) {
                assert( equal( typeof data, "string" ),
                    "Can't print the library file info, because the given data is NOT a type of `string`."
                );

                let container = document.getElementById( containerDomId );
                container.innerHTML += "LibFile - " + data;
            }

            printDataFilesUrl( url ) {
                assert( equal( typeof url, "string" ),
                    "Can't print the URL of the data files, because it's NOT a type of `string`."
                );

                let container = document.getElementById( containerDomId );
                let div = document.createElement( "div" );
                div.innerHTML = "<br>Data files URL:<br>" + url;
                container.appendChild( div );
            }

            printLanguagesInfo( languages ) {
                if ( languages instanceof Array ) {
                    let container = document.getElementById( containerDomId );

                    for ( let item of languages ) {
                        const node = {
                            shortName    : equal( item.shortName, "" )   ? "none" : item.displayName,
                            diplayName   : equal( item.displayName, "" ) ? "none" : item.displayName,
                            showInPlayer : item.showInPlayer
                        };

                        let list = document.createElement( "ul" );
                        list.innerText = "Language:";

                        for ( let item in node ) {
                            let option = document.createElement( "li" );
                            option.style.marginLeft = "25px";
                            option.innerText = node[ item ];
                            list.appendChild( option );
                        }

                        container.appendChild( document.createElement( "br" ) );
                        container.appendChild( list );
                    }
                }
            }

            readCurrentTab() {
                let self = this;

                chrome.tabs.query( { "active": true, "currentWindow": true }, function( tabs ) {
                    if ( !tabs || equal( tabs.length, 0 ) )
                        self.printNullablePage();
                    else {
                        let tabId = tabs[ 0 ].id;
                        let url   = tabs[ 0 ].url;

                        chrome.tabs.sendMessage( tabId, fetchKeyword,
                            function( response ) {
                                if ( response ) {
                                    let documentObject = self.prepareDocumentObject( response );

                                    ( url.indexOf( urlPrefix ) !== -1 )
                                        ? self.parseDocument( documentObject )
                                        : self.printNullablePage();
                                }
                                else
                                    self.printNullablePage();
                            }
                        );
                    }

                    self.triggerThrobber();
                    self.triggerContainer();
                });
            }

            prepareDocumentObject( htmlContent ) {
                assert( equal( typeof htmlContent, "string" ),
                    "Can't create a new DOM instance, because the given HTML content is NOT a type of `string`."
                );

                let documentObject = document.implementation.createHTMLDocument( "" );
                documentObject.open( "text/html" );
                documentObject.write( htmlContent );
                documentObject.close();
                return documentObject;
            }

            findTextFileUrl( url ) {
                let self = this;

                async( function*() {
                    let scriptContent = yield WalkMe.Web.sendRequest( url );

                    assert( equal( typeof scriptContent, "string" ),
                        "Can't continue to find `settings.txt` path, because the response from XHR is NOT a type of `string`."
                    );

                    let fetchedUrl = scriptContent.match( regexUrl );

                    if ( fetchedUrl ) {
                        assert( equal( typeof fetchedUrl[ 0 ], "string" ),
                            "Can't continue to find `settings.txt` path, because the fetched string after regular expression is NOT a type of `string`."
                        );

                        let fileContent   = yield WalkMe.Web.sendRequest( fetchedUrl[ 0 ] );
                        let data = self.parseFileContent( fileContent );
                        self.printAdditionalInfo( data );
                    }
                });
            }

            parseFileContent( content ) {
                assert( equal( typeof content, "string" ),
                    "Can't parse the file content, because the given content isn't a type of `string`."
                );

                let data = regexFile.exec( content );

                if ( !data )
                    throw new Error( "Can't parse the file content, because the fetched data after regular expression is undefined." );

                return JSON.parse( data[ 1 ].replace( regexReplace,'"' ) );
            }

            parseDocument( documentObject ) {
                assert( documentObject instanceof HTMLDocument,
                    "Can't parse the given DOM object, because the given document object is NOT an instance of `HTMLDocument`."
                );

                let outputData = new Set();
                let scripts = documentObject.getElementsByTagName( "script" );

                for ( let i = 0; i < scripts.length; i++ ) {
                    let item = scripts[ i ];

                    if ( !equal( typeof item, "undefined" ) && item.src.indexOf( "cdn." + urlPrefix ) !== -1 ) {
                        let parsedData = this.parseScriptUrl( item.src );

                        outputData.add( WalkMe.Models.UrlData({
                            userId      : parsedData.userId,
                            environment : parsedData.environment,
                            hostname    : parsedData.hostname,
                            https       : parsedData.isSecure,
                            async       : item.async
                        }));

                        this.findTextFileUrl( item.src );
                    }
                }

                ( outputData.size > 0 )
                    ? this.printResultPage( outputData )
                    : this.printNullablePage();
            }

            parseScriptUrl( url ) {
                assert( equal( typeof url, "string" ),
                    "Given script URL is NOT a type of `string`."
                );

                let parts = url.split( '/' );

                return {
                    hostname    : parts[ 2 ],
                    environment : parts[ 3 ],
                    userId      : parts[ 4 ],
                    isSecure    : ( () => {
                        return ( equal( parts[ 5 ].indexOf( "https" ), -1 ) )
                            ? false
                            : true;
                    })()
                };
            }

            triggerThrobber() {
                let throbber = document.getElementById( throbberDomId );

                if ( throbber.classList.contains( "hidden" ) )
                    throbber.classList.remove( "hidden" );
                else
                    throbber.classList.add( "hidden" );
            }

            triggerContainer() {
                let container = document.getElementById( containerDomId );

                if ( container.classList.contains( "hidden" ) )
                    container.classList.remove( "hidden" );
                else
                    container.classList.add( "hidden" );
            }
        }

        WalkMe.PageHandler = PageHandler;

    })( extensionContext );

    globalContext[ extensionName ] = extensionContext;

    document.addEventListener( "DOMContentLoaded", function( event ) {
        const defaultDelay = 1000;

        allocateCallstack( function() {
            let handler = new WalkMe.PageHandler();
            handler.readCurrentTab();
        }, defaultDelay );
    });

})( window, "WalkMe" );
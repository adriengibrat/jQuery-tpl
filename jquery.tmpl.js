/* jQuery Templating Plugin
 * Copyright 2010, John Resig
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */
( function ( $ ) {
	// Override DOM manipulation function
	var domManip = $.fn.domManip;
	$.fn.extend( {
		tpl: function ( data ) {
			return this.map( function ( index, template ) {
				return $.tpl( template, data );
			} );
		},
		// Allow to do: .append( "template", dataObject )
		domManip: function ( args ) {
			// This appears to be a bug in the appendTo, etc. implementation
			// it should be doing .call() instead of .apply(). See #6227
			if ( args.length > 1 && args[ 0 ].nodeType )
				arguments[ 0 ] = [ $.makeArray( args ) ];
			if ( args.length === 2 && typeof args[ 0 ] === 'string' && typeof args[ 1 ] !== 'string' )
				arguments[ 0 ] = [ $.tpl( args[ 0 ], args[ 1 ] ) ];
			return domManip.apply( this, arguments );
		}
	} );
	/* Usage :
	 *   $.tpl.cache.foo = $.tpl( 'some long templating string' );
	 *   $( '#test' ).append( 'foo', data );
	 */
	$.tpl = $.extend( function( template, data ) {
			var render;
			// Use a pre-defined template, if available
			if ( $.tpl.cache[ template ] )
				render = $.tpl.cache[ template ];
			// We're pulling from a node
			else if ( template.nodeType )
				render = $.data( template ).tpl || $.tpl.compile( template.innerHTML, template.id );
			else
				render = $.tpl.compile( template );// @todo load from url ?
			return $.isArray( data ) ?
				$.map( data, function( data, index ) {
					return render.call( data, data, index );
				} ) :
				render.call( data, data, 0 );
		}
	, {
		compile  : function ( template, id ) {
			var render = [
					'var $ = jQuery, $buffer = [];'
					// Scope data as local variables
					, 'with ( $data ) {'
					, $.tpl.parse( template )
					, '};'
					//@todo : bug when template starts or ends with text nodes
					, 'return $( $buffer.join( "" ) ).get();'
				];
			// Reusable template generator function.
			return $.tpl.cache[ id || template ] = new Function( '$data', '$i', render.join( '\n' ) );
		}
		, parse  : function ( template ) {
			return '$buffer.push( "'
				// Convert the template into pure JavaScript
				+ template
					.replace( /\r\n|[\n\v\f\r\x85\u2028\u2029]/g, ' ' ) // remove new lines
					.replace( /"/g, '\\"' ) // escape quotes
					.replace( /{{([\w$]+)}}/g, '{{= $1}}' ) // default to echo
					.replace( /{{(\/?)(\w+|.)(?:\((.*?)\))?(?: (.*?))?}}/g, function ( all, slash, type, fnargs, args ) {
						var tmpl = $.tpl.fn[ type ];
						if ( ! tmpl )
							//return '" );\nbuffer.push( "';
							throw 'Template function not found: ' + type;
						return '" );\n' + tmpl[ slash ? 'suffix' : 'prefix' ]
							.split( '$1' ).join( args || tmpl._default[ 0 ] )
							.split( '$2' ).join( fnargs || tmpl._default[ 1 ] ) + '\n$buffer.push( "';
					} )
				+ '" );';
		}
		, encode : function ( text ) {
			return text != null ?
				document.createTextNode( text.toString() ).nodeValue :
				'' ;
		}
		, cache  : {}
		, fn     : {
			each   : {
				_default : [ null, 'index' ]
				, prefix : '$.each( $1, function ( $2 ) { with ( this ) {'
				, suffix : '} } );'
			}
			, if   : {
				prefix   : 'if ( $1 ) {'
				, suffix : '}'
			}
			, else : {
				prefix : '} else {'
			}
			, html : {
				prefix : '$buffer.push( $.isFunction( $1 ) ? $1.call( this ) : $1 );'
			}
			, '='  : {
				_default : [ 'this' ]
				, prefix : '$buffer.push( $.tpl.encode( $.isFunction( $1 ) ? $1.call( this ) : $1 ) );'
			}
		}
	} );
} )( jQuery );
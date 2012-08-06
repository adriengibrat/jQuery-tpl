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
				return $.tpl( template, data ).get();
			} );
		},
		// Allow to do: .append( "template", dataObject )
		domManip: function ( args ) {
			// This appears to be a bug in the appendTo, etc. implementation
			// it should be doing .call() instead of .apply(). See #6227
			if ( args.length > 1 && args[ 0 ].nodeType )
				arguments[ 0 ] = [ $.makeArray( args ) ];
			if ( args.length === 2 && typeof args[ 0 ] === 'string' && typeof args[ 1 ] !== 'string' )
				arguments[ 0 ] = $.tpl( args[ 0 ], args[ 1 ] );
			return domManip.apply( this, arguments );
		}
	} );
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
				$( $.map( data, function( data, index ) {
					return render.call( data, data, index ).get();
				} ) ) :
				render.call( data, data, 0 );
		}
	, {
		compile  : function ( template, id ) {
			var render = [
					'var $ = jQuery, $buffer = [];'
					// Scope data as local variables
					, 'with ( $data ) {'
					, '$buffer.push( "'
					// Convert the template into pure JavaScript
					+ template
						.replace( /\r\n|[\n\v\f\r\x85\u2028\u2029]/g, ' ' ) // remove new lines
						.replace( /"/g, '\\"' )                             // escape quotes
						.replace( /{{(\W?\s?)([^\s}]*)}}(?:(.*?){{\/\2}})?/g, function ( all, command, data, content ) {
							var tmpl = $.tpl.fn[ $.trim( command ) ];
							if ( ! tmpl )
								return '" );\n$buffer.push( "';
								//throw 'Command not found: ' + command;
							return '" );\n$buffer.push( '
								+ tmpl
									.split( '$1' ).join( data )
									.split( '$2' ).join( content )
								+ ' );\n$buffer.push( "';
						} )
					+ '" );'
					, '};'
					, 'return $( "<tpl>" + $buffer.join( "" ) + "</tpl>" ).contents();'
				];
			// Reusable template generator function.
			return $.tpl.cache[ id || template ] = new Function( '$data', '$index', render.join( '\n' ) );
		}
		, encode : function ( text ) {
			return text != null ?
				document.createTextNode( text.toString() ).nodeValue :
				'' ;
		}
		, render : function ( nodes ) {
			return $.map( nodes, function ( element ) {
					if ( ! element || ! element.nodeType )
						return element;
					return element.innerHTML || element.nodeValue;
				} ).join( '' );
		}
		, cache  : {}
		, fn     : {
			'#'   : '$1 ? $.map( $.makeArray( $1 ), function ( data ) { return $.tpl.render( $.tpl( "$2", data ) ); } ).join( "" ) : null'
			, ''  : '$.tpl.encode( $.isFunction( $1 ) ? $1.call( this ) : $1 )'
			, '&' : '$.isFunction( $1 ) ? $1.call( this ) : $1'
			, '>' : '$.tpl.render( $.tpl( "$1", $data ) )'
			, '^' : '$1 ? null : "$2"'
			, '.' : '$data'
			, '*' : '$index'
			, '!' : null
		}
	} );
} )( jQuery );
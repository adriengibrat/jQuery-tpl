/* jQuery Templating Plugin
 * Copyright 2010, John Resig
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */
( function ( $ ) {
	var plugin      = function tpl ( template, data ) {
			var tpl = $[ namespace ]
				, render;
			// Use a pre-defined template, if available
			if ( tpl.cache[ template ] )
				render = tpl.cache[ template ];
			// We're pulling from a node
			else if ( template.nodeType )
				render = $.data( template )[ namespace ] || tpl.compile( template.innerHTML, template.id );
			else if ( /^#?\w+$/.test( template ) && document.getElementById( template.replace( /^#/, '' ) ) && ( template  = $( template.replace( /(^)(?!#)/, '#' ) ) ) )
				render = template.data( namespace ) || tpl.compile( template.html(), template.attr( 'id' ) );
			else // @todo load from url ?
				render = tpl.compile( template );
			return $.isArray( data ) ?
				$( $.map( data, function( data, index ) {
					return render.call( data, data, index ).get();
				} ) ) :
				render.call( data, data, 0 );
		}
		, namespace = plugin.name
		// Override DOM manipulation function
		, domManip  = $.fn.domManip;
	$.fn.domManip     = function ( args ) {
		// This appears to be a bug in the appendTo, etc. implementation
		// it should be doing .call() instead of .apply(). See #6227
		if ( args.length > 1 && args[ 0 ].nodeType )
			arguments[ 0 ] = [ $.makeArray( args ) ];
		if ( args.length === 2 && typeof args[ 0 ] === 'string' && typeof args[ 1 ] !== 'string' )
			arguments[ 0 ] = $[ namespace ]( args[ 0 ], args[ 1 ] );
		return domManip.apply( this, arguments );
	};
	$.fn[ namespace ] = function ( data ) {
		return this.map( function ( index, template ) {
			return $[ namespace ]( template, data ).get();
		} );
	};
	$[ namespace ]    = $.extend( plugin , {
		compile  : function ( template, id ) {
			var render = [
					'var $ = jQuery, $buffer = [];'
					, '$buffer.push( "'
					// Convert the template into pure JavaScript
					+ template
						.replace( /"/g, '\\"' ) // escape quotes
						.replace( /\r\n|[\n\v\f\r\x85\u2028\u2029]/g, '" + "\\n" + "' ) // escape new lines
						.replace( /{{(\W?\s?)([^}]*)}}(?:(.*?){{\/\2}})?/g, function ( all, command, data, content ) {
							var tmpl = $[ namespace ].fn[ $.trim( command ) ];
							if ( ! tmpl )
								return '" );\n$buffer.push( "';
								//throw 'Command not found: ' + command;
							return '" );\n$buffer.push( '
								+ tmpl
									.split( '$0' ).join( data )
									.split( '$1' ).join( '$data["' + data + '"]' )
									.split( '$2' ).join( content )
								+ ' );\n$buffer.push( "';
						} )
					+ '" );'
					, 'return $( "<' + namespace + '>" + $buffer.join( "" ) + "</' + namespace + '>" ).contents();'
				];
			// Reusable template generator function.
			return $[ namespace ].cache[ id || template ] = new Function( '$data', '$index', render.join( '\n' ) );
		}
		, encode : function ( text ) {
			return text ? $( '<' + namespace + '/>' ).text( text ).html() : '' ;
		}
		, render : function ( nodes ) {
			return $.map( nodes, function ( element ) {
					if ( ! element || ! element.nodeType )
						return element;
					return $( element ).wrap( '<' + namespace + '/>' ).parent().html();
				} ).join( '' );
		}
		, cache  : {}
		, fn     : {
			'#'   : '$1 ? $.map( $.makeArray( typeof $1 === "boolean" ? $data : $1 ), function ( data ) { \
	return $.' + namespace + '.render( $.isFunction( data ) ? data.call( $data, $.' + namespace + '( "$2", $data ) ) : $.' + namespace + '( "$2", data ) );\
} ).join( "" ) : null'
			, ''  : '$.' + namespace + '.encode( $.isFunction( $1 ) ? $1.call( $data ) : $1 )'
			, '&' : '$.isFunction( $1 ) ? $1.call( $data ) : $1'
			, '>' : '$.' + namespace + '.render( $.' + namespace + '( "$0", $data ) )'
			, '^' : '$1 && $1.length ? null : "$2"'
			, '.' : '$data'
			, '*' : '$index'
			, '!' : null
		}
	} );
} )( jQuery );
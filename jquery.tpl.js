/* Logicless templating for jQuery using Mustache like markup & syntax
 * Copyright 2012, Adrien Gibrat
 * Dual licensed under the MIT or GPL Version 2 licenses
 */
( function ( $ ) {
	var plugin      = function ( template, data ) {
			var tpl;
			if ( template.nodeType ) // Get template from a node (and caching in data)
				tpl = $.data( template, namespace ) || $.data( template, namespace, plugin.compile( template.innerHTML, template.id ) );
			else if ( plugin.cache[ template ] ) // Use pre-defined template, if available
				tpl = plugin.cache[ template ];
			else if ( /^#?\w+$/.test( template ) && ( tpl = document.getElementById( template.replace( /^#/, '' ) ) ) ) // Get template from element with given Id (accept Id prefixed with #)
				return plugin( tpl, data, arguments[ 2 ] );
			else
				tpl = plugin.compile( template );
			return $.isArray( data ) ?
				$( $.map( data, function( data, index ) {
					return tpl.call( data, data, index ).get();
				} ) ) :
				tpl.call( data, data, arguments[ 2 ] || 0 );
		}
		, namespace = 'tpl'
		, domManip  = $.fn.domManip
		, add       = $.fn.add;
	$.fn.domManip     = function ( args ) {
		if ( args.length === 2 && typeof args[ 0 ] === 'string' && typeof args[ 1 ] !== 'string' )
			arguments[ 0 ] = plugin( args[ 0 ], args[ 1 ] );
		return domManip.apply( this, arguments );
	};
	$.fn.add          = function ( template, data ) {
		if ( typeof template === 'string' && ( $.isArray( data ) || $.isPlainObject( data ) ) )
			return add.call( this, plugin( template, data ) );
		return add.apply( this, arguments );
	};
	$.fn[ namespace ] = function ( data ) {
		return this.map( function ( index, template ) {
			return plugin( template, data ).get();
		} );
	};
	$[ namespace ]    = $.extend( plugin , {
		compile  : function ( template, id ) {
			return plugin.cache[ id || template ] = new Function( '$data', '$index', [
					'var $ = jQuery, $buffer = [];'
					, '$buffer.push( "'
					+ template
						.replace( /"/g, '\\"' ) // Escape quotes
						.replace( /\r\n|[\n\v\f\r\x85\u2028\u2029]/g, '" + "\\n" + "' ) // Escape new lines
						.replace( /{{(\W?\s?)([^}]*)}}(?:(.*?){{\/\2}})?/g, function ( all, command, data, content ) {
							var tmpl = plugin.fn[ $.trim( command ) ];
							if ( ! tmpl )
								return '" );\n$buffer.push( "';//throw 'Command not found: ' + command;
							return '" );\n$buffer.push( '
								+ tmpl
									.split( '$0' ).join( '"' + data + '"' )
									.split( '$1' ).join( '$data["' + data + '"]' )
									.split( '$2' ).join( '"' + content + '"' )
								+ ' );\n$buffer.push( "';
						} )
					+ '" );'
					, 'return $( "<' + namespace + '>" + $.trim( $buffer.join( "" ) ) + "</' + namespace + '>" ).contents();'
				].join( '\n' ) );
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
			'#'   : '$1 ? \
$.map( $.makeArray( typeof $1 === "boolean" ? $data : $1 ), function ( data, index ) { \
	return $.' + namespace + '.render( \
		$.isFunction( data ) ?\
			data.call( $data, $.' + namespace + '( $2, $data, index ) ) : \
			$.' + namespace + '( $2, data, index ) \
	); \
} ).join( "" ) : \
null'
			, ''  : '$.' + namespace + '.encode( $.isFunction( $1 ) ? $1.call( $data ) : $1 )'
			, '&' : '$.isFunction( $1 ) ? $1.call( $data ) : $1'
			, '>' : '$.' + namespace + '.render( $.' + namespace + '( $0, $data, $index ) )'
			, '^' : '$1 && $1.length ? null : $2'
			, '.' : '$data'
			, '*' : '$index + ( parseInt( $0, 10 ) || 0 )'
			, '!' : null
		}
	} );
} )( jQuery );

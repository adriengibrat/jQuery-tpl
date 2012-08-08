Light & logicless templating for jQuery using Mustache like markup & syntax.

@see  http://mustache.github.com/mustache.5.html for markup & syntax.
@todo Write real doc.
```javascript
// Append one Item
$( '#litpl' )
	.tpl( object )
	.appendTo( 'ul' );
// Or
$( 'ul' ).append( '#sometmpl', object );

// Append multiple Items
$( '#litpl' )
	.tpl( arrayOfObjects )
	.appendTo( 'ul' );
//Or
$( 'ul' ).append( '#sometmpl', arrayOfObjects );
```
```html
<ul></ul>
<script id="litpl" type="text/html">
<li><b>{{property}}</b></li>
</script>
```
* Support n based index with {{*n}} tag (get index of array of data)
* Don't support delimiter's change yet
* Don't support nested {{#blocks}} with same names (and won't support it as I use regex and not state machine)
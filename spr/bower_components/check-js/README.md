checkjs
====================

A "good enough" JavaScript runtime type checking library.

Type checking can incur a small performance cost. Take this into
consideration when using it. There is also a flag which you can
set to turn off typechecking. If you want to see the performance cost,
run the timing test in check.spec.js on the browsers you care about.

### primitives
<pre>
check(1).isNumber();
check(true).isBoolean();
check('a').isString();
check([]).isArray();
check({}).isObject();
check(function(){}).isFunction();
</pre>

### isDefined
Verifies that the value is defined. Kinda like a null check in other
languages.
<pre>
check(1).isDefined();
</pre>

### custom classes
<pre>
var Animal = function() {};
var cat = new Animal();

check(cat).isOfType(Animal);
</pre>

### array/object enumeration
You can bulk verify each value in an array or object.

<pre>
check([true, true]).each().isBoolean();
check({a : true, b : true}).each().isBoolean();
</pre>

You can also selectively verify by providing a filter function.

<pre>
check({a : true, b : 1}).each(
  function(value, key) {return key === 'a';}).isBoolean();
</pre>

### passive
By default check throws an exception when the value is not the expected
type. You can force it to return true/false by calling the passive function.
<pre>
check(1).passive().isNumber();
</pre>

### msg
By default check exception messages dumps the actual type vs the expected type.
You can give it your own error message that might make more sense using msg().
<pre>
function add(a, b) {
    check([a, b]).each().msg('Please provide valid numbers').isNumber();
};
</pre>

### check.globals
There is a global settings object that can be used to specify
how check behaves.

#### check.globals.on
Set this value to true if you want type checking to be performed.
If this value is set to false, all type checking are ignored and simply return true.
***Warning*** this can cause logical errors if check is used inside logical statements
(if/else branches). As a general rule, don't turn this off if you use passive().

<pre>
check.globals.on = true/false
</pre>

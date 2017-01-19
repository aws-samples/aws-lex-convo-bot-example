# free-falafel

Transform the [ast](http://en.wikipedia.org/wiki/Abstract_syntax_tree) on a recursive walk.

[![Build Status](https://travis-ci.org/freethenation/node-falafel.png?branch=master)](https://travis-ci.org/freethenation/node-falafel)

This module is like [burrito](https://github.com/substack/node-burrito),
except that it uses [esprima](http://esprima.org) instead of
[uglify](https://github.com/mishoo/UglifyJS) for friendlier-looking ast nodes.

# Example

## array.js

Put a function wrapper around all array literals.

``` js
var falafel = require('free-falafel');

var src = '(' + function () {
    var xs = [ 1, 2, [ 3, 4 ] ];
    var ys = [ 5, 6 ];
    console.dir([ xs, ys ]);
} + ')()';

var output = falafel(src, function (node) {
    if (node.type === 'ArrayExpression') {
        node.update('fn(' + node.source() + ')');
    }
});
console.log(output);
```

output:

```
(function () {
    var xs = fn([ 1, 2, fn([ 3, 4 ]) ]);
    var ys = fn([ 5, 6 ]);
    console.dir(fn([ xs, ys ]));
})()
```

# Methods

``` js
var falafel = require('free-falafel')
```

## falafel(src, opts={}, fn, breadthFirstFn)

Transform the string source `src` with the function `fn`, returning a
string-like transformed output object.

For every node in the ast, `fn(node)` fires. The recursive walk is 
depth first, so children get called before their parents.

Performing the transforms during a depth first traversal makes it easier 
to write nested transforms since transforming parents often requires transforming 
all its children first.

The return value is string-like (it defines `.toString()` and `.inspect()`) so
that you can call `node.update()` asynchronously after the function has
returned and still capture the output.

Instead of passing a `src` you can also pass `opts.source` or, if the source code
has already been parsed into an ast, you can pass `opts.ast`.

All of the `opts` will be passed directly to esprima except for `'range'` which
is always turned on because falafel needs it.

Some of the options you might want from esprima includes:
`'loc'`, `'raw'`, `'comments'`, `'tokens'`, and `'tolerant'`.

You can optionally provide the function `breadthFirstFn`. This function will be
called before `fn` during a breadth first traversal of the ast. This function allows
you to add additional properties to the `node` parameter so that you can easily do things
like not transforming any code inside of a function definition. There is an example of
this below.

# Nodes

Aside from the regular [esprima](http://esprima.org) data, you can also call
some inserted methods on nodes.

Aside from updating the current node, you can also reach into sub-nodes to call
update functions on children from parent nodes.

## node.source()

Return the source for the given node, including any modifications made to
children nodes.

## node.update(s)

Transform the source for the present node to the string `s`. This function is not
available during the breadth first traversal of the ast.

Note that in `'ForStatement'` node types, there is an existing subnode called
`update`. For those nodes all the properties are copied over onto the
`node.update()` function.

## node.parent

Reference to the parent element or `null` at the root element.

# More Examples

## breadthFirstFn example
Put a function wrapper around all array literals that are not inside of a function definition.

``` js
var falafel = require('free-falafel');

var src = '(' + function () {
    var xs = [ 1, 2, [ 3, 4 ] ];
    var ys = [ 5, 6 ];
    somefunc([ xs, ys ]);
} + ')();\n';
src += 'var g = [ 5, 6 ];';

var output = falafel(src, 
    function (node) {
        if (node.type === 'ArrayExpression' && !node.inFunc) {
            node.update('fn(' + node.source() + ')');
        }
    },
    function (node) {
        if (node.type === 'FunctionExpression') {
            node.inFunc = true;
        }
        else if (node.parent && node.parent.inFunc) {
            //inherit from parent
            node.inFunc = node.parent.inFunc;
        }
        else { node.inFunc = false; }
    });
console.log(output.toString());
```

output:

```
(function () {
    var xs = [ 1, 2, [ 3, 4 ] ];
    var ys = [ 5, 6 ];
    somefunc([ xs, ys ]);
})();
var g = fn([ 5, 6 ]);
```

You can play with this example at JS Bin [here](http://jsbin.com/free-falafel/4/edit)

# Install

With [npm](http://npmjs.org) do:

```
npm install free-falafel
```

# License

MIT


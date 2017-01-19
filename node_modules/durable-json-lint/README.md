# Durable Json Lint
_________________________
Durable Json Lint is a Json Lint library that can parse and partially correct dirty Json. Unlike most Json lint libraries it does its best not to crash after encountering errors. It can be installed via npm using the command `npm install durable-json-lint`.

# Features
_________________________
* Can correct simple errors like using `'` instead of `"`
* Most of the time it will report more than the first error encountered in the Json
* If dirty Json is encountered (for example a function call) the error will be reported and a null will be substituted in for the invalid Json, creating valid Json.

# Usage
_________________________
```javascript
durableJsonLint = require('durable-json-lint');
console.log(durableJsonLint('{name:"value", \'array\':[call(), 0x11]}'))
// The above code would print the following to the console
{
   "json":'{"name":"value", "array":[null, 17]}',
   "errors":[{
         "column":1,
         "description":"Keys must be double quoted in Json. Did you mean \"name\"?",
         "lineNumber":1,
         "status":"correctable"
      },{
         "column":15,
         "description":"Json strings must use double quotes",
         "lineNumber":1,
         "status":"correctable"
      },{
         "column":24,
         "description":"You can not make function calls in Json. Do you think I am a fool?",
         "lineNumber":1,
         "status":"fail"
      },{
         "column":32,
         "description":"Invalid Json number",
         "lineNumber":1,
         "status":"correctable"
      }
   ]
}
```

Durable Json Lint runs in the browser too! You can checkout the example above at [JS Bin](http://jsbin.com/ojeyup/2/edit).

# Api
__________________________
A single function is exposed with the following signature

```javascript
durableJsonLint(sourceCode);
```

The function returns an object with the following format

```javascript
{
    json:'{"json":"string"}' //the corrected Json
    errors:[                 //a list of errors
        {
            lineNumber:9     //the line the error occurred on
            column:9         //the column the error occurred on
            description:"txt"//a description of the error
            status:"fail"    //the status of the error
        }
    ]
}
```

## Error Status

It is worth briefly describing the possible error statuses

* correctable: the error can be automatically corrected
* guessable: the parser has a good guess about how the error can be automatically corrected
* fail: the parser has no idea how to fix the error. The parser will likely just substitute in null
* crash: the parser was completely unable to parse the Json. 



var request = require('request');
durableJsonLint = require('./lib/durable-json-lint');

request({
    url: "http://www.omdbapi.com/?i=tt2091423&plot=small&r=json ",
    json:true
}, function(err, response, json){
    if (json && typeof json !== 'object'){
        console.log(json);
        console.log(durableJsonLint(json));
        json = JSON.parse(durableJsonLint(json).json); // each record is sucessfully parsed and output 
        console.log(json.Title);
        console.log(json.Plot);
    }
});
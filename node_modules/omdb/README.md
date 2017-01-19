# omdb
A simple Node.JS module to access and normalize data from the
[OMDb API](http://www.omdbapi.com/) by Bryan Fritz.

## Installation
    $ npm install omdb

## Examples

```javascript
var omdb = require('omdb');

omdb.search('saw', function(err, movies) {
    if(err) {
        return console.error(err);
    }

    if(movies.length < 1) {
        return console.log('No movies were found!');
    }

    movies.forEach(function(movie) {
        console.log('%s (%d)', movie.title, movie.year);
    });

    // Saw (2004)
    // Saw II (2005)
    // Saw III (2006)
    // Saw IV (2007)
    // ...
});

omdb.get({ title: 'Saw', year: 2004 }, true, function(err, movie) {
    if(err) {
        return console.error(err);
    }

    if(!movie) {
        return console.log('Movie not found!');
    }

    console.log('%s (%d) %d/10', movie.title, movie.year, movie.imdb.rating);
    console.log(movie.plot);

    // Saw (2004) 7.6/10
    // Two men wake up at opposite sides of a dirty, disused bathroom, chained
    // by their ankles to pipes. Between them lies...
});
```

## API
### omdb.search(terms, callback)
Run a search request on the API.

`terms` can either be a string of search terms, or the following object:
```javascript
{
    terms: String,
    year: Number, // optional
    type: 'series' || 'movie' || 'episode' // optional
}
```

`callback` returns an array of movies. If no movies are found, the array
is empty. The array will contain objects of the following:
```javascript
{
    title: String, // the title of the movie
    type: 'series' || 'movie' || 'episode',

    // If `type` is "series":
    year: {
        from: Number,
        to: Number || undefined // (if the series is still airing)
    },

    // Otherwise,
    year: Number,

    imdb: String,
    poster: String
}
```

### omdb.get(show, [options], callback)
Run a single movie request on the API.

`show` is assumed to be one of the following, respectively:

1. An object with an `imdb` property.

    `{ imdb: 'tt0387564' }`
2. An object with a `title` property, and or `year` and `type` properties.

    `{ title: 'Saw', year: 2004, type: 'movie' }`
3. An IMDb ID string.

    `'tt0387564'`
4. A title string.

    `'Saw'`

Additionally, `options` object can be passed with the following parameters:
- `fullPlot` is an optional argument that if set to `true`, will attempt to request the extended version of the movie's plot.
- `tomatoes` is an optional argument that if set to `true`, will attempt to request the Rotten Tomatoes rating info.

`callback` returns an object of the movie's information. If no movies are
found, it will return `null`.

See the following for a list of possible properties:
https://github.com/misterhat/omdb/blob/master/index.js#L237

### omdb.poster(show)
Return a readable stream of the poster JPEG.

`show` is the same as the `show` argument used in `.get()`.

## License
MIT

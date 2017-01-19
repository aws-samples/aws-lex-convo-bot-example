var tap = require('tap').test,

    omdb = require('./');

var SEARCH_PROPERTIES = [ 'title', 'year', 'imdb', 'type' ];

tap('correct searching', function (test) {
    test.plan(2 + SEARCH_PROPERTIES.length);

    omdb.search('saw', function (err, movies) {
        var movie = movies[0];

        test.notOk(err, 'no errors');
        test.ok(!!movie, 'there is at least one movie');

        SEARCH_PROPERTIES.forEach(function (property) {
            test.ok(movie && movie[property], 'movie has ' + property);
        });
    });
});

tap('incorrect searching', function (test) {
    test.plan(3);

    omdb.search('gHwZjE9BqsbCYmjBFwqWTyWV', function (err, movies) {
        test.notOk(err, 'no errors');
        test.ok(Array.isArray(movies), 'movies is an array');
        test.equals(movies.length, 0, 'movies array is empty');
    });
});

tap('specific movie', function (test) {
    test.plan(2);

    omdb.get('tt0057012', function (err, movie) {
        test.notOk(err, 'no errors');
        test.ok(movie, 'movie exists');
    });
});

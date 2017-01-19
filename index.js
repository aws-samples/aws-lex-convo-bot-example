'use strict';
var omdb = require('omdb');
     
    // Close dialog with the customer, reporting fulfillmentState of Failed or Fulfilled ("Thanks, your pizza will arrive in 20 minutes")
    function close(sessionAttributes, fulfillmentState, message) {
        return {
            sessionAttributes,
            dialogAction: {
                type: 'Close',
                fulfillmentState,
                message,
            },
        };
    }
     
    // --------------- Events -----------------------
     
    function dispatch(intentRequest, callback) {
        console.log('request received for userId=${intentRequest.userId}, intentName=${intentRequest.currentIntent.intentName}');
        const sessionAttributes = intentRequest.sessionAttributes;
        const slots = intentRequest.currentIntent.slots;
        const moviename = slots.name;
        const whatInfo = slots.summary;
        console.log(`request received for Slots=${moviename}, ${whatInfo}`);
        
        
        omdb.get({ title: moviename  }, true, function(err, movie) {
    if(err) {
        return console.error(err);
    }

    if(!movie) {
        return console.log('Movie not found!');
    }
    var movietitle = movie.title;
    var date = movie.year;
    var actors = movie.actors;
    var rating = movie.imdb.rating;
    var plot = movie.plot;
    var votes = movie.imdb.votes;
    var director =movie.director;

       if (whatInfo === 'Rating' || whatInfo === 'rating'){
        callback(close(sessionAttributes, 'Fulfilled',
        {'contentType': 'PlainText', 'content': `Rating of ${moviename} is ${rating}`}));
        
    }
      else if (whatInfo === 'Actors' || whatInfo === 'actors' || whatInfo === 'actor' || whatInfo === 'Actor'){
        callback(close(sessionAttributes, 'Fulfilled',
        {'contentType': 'PlainText', 'content': `Actors: ${actors}`}));
      }

      else if (whatInfo === 'votes' || whatInfo === 'vote' || whatInfo === 'Votes' || whatInfo === 'Vote'){
        callback(close(sessionAttributes, 'Fulfilled',
        {'contentType': 'PlainText', 'content': `Votes for ${moviename}: ${votes}`}));
      }
      
      else if (whatInfo === 'Plot' || whatInfo === 'Story' || whatInfo === 'plot' || whatInfo === 'story'){
        callback(close(sessionAttributes, 'Fulfilled',
        {'contentType': 'PlainText', 'content': `Plot of ${moviename} is: ${plot}`}));
      }
      
      else if (whatInfo === 'Year' || whatInfo === 'Release Date' || whatInfo === 'release date'|| whatInfo === 'Release Year' || whatInfo === 'release year' || whatInfo === 'year'){
        callback(close(sessionAttributes, 'Fulfilled',
        {'contentType': 'PlainText', 'content': ` ${moviename} released in: ${date}`}));
      }
      
      else if (whatInfo === 'Director' || whatInfo === 'director'){
        callback(close(sessionAttributes, 'Fulfilled',
        {'contentType': 'PlainText', 'content': `Director of ${moviename} is/are: ${director}`}));
      }


       else
        callback(close(sessionAttributes, 'Fulfilled',
        {'contentType': 'PlainText', 'content': `MovieName: ${moviename}, Year: ${date}, Actors: ${actors}, Rating: ${rating}, Plot: ${plot} Votes: ${votes} Director: ${director}`}));
        
    }
    )}
     
    // --------------- Main handler -----------------------
     
    // Route the incoming request based on intent.
    // The JSON body of the request is provided in the event slot.
    exports.handler = (event, context, callback) => {
        try {
            dispatch(event,
                (response) => {
                    callback(null, response);
                });
        } catch (err) {
            callback(err);
        }
    };

'use strict';
const tmdb = require('tmdbv3').init('35440259b50e646a6485055c83367ccd');
     
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
        var moviename = slots.name;
        var whatInfo = slots.summary;
        console.log(`request received for Slots=${moviename}, ${whatInfo}`);
        
        tmdb.search.movie( `${moviename}`, function(err,res) {
    if (err)
        console.log(err);
    else
        tmdb.movie.info(res.results[0].id, function(err,res){
          var resPlot = res.overview;
          var resDate = res.release_date;
          console.log(res);
if  (whatInfo === 'Year' || whatInfo === 'Release Date' || whatInfo === 'release date'|| whatInfo === 'date'|| whatInfo === 'date'|| whatInfo === 'Release Year' || whatInfo === 'release year' || whatInfo === 'year'){
        callback(close(sessionAttributes, 'Fulfilled',
        {'contentType': 'PlainText', 'content': ` ${moviename} released in: ${resDate}`}));
      }


      else if (whatInfo === 'Plot' || whatInfo === 'Story' || whatInfo === 'plot' || whatInfo === 'story'){
        callback(close(sessionAttributes, 'Fulfilled',
        {'contentType': 'PlainText', 'content': `Plot of ${moviename} is: ${resPlot}`}));
      }

      else
        callback(close(sessionAttributes, 'Fulfilled',
        {'contentType': 'PlainText', 'content': `MovieName: ${moviename}, Year: ${resDate}, APlot: ${resPlot}`}));
});
});
}
   
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


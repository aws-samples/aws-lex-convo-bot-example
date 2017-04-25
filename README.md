# aws-lex-convo-bot-example
Reference implementation on building a conversational Amazon Lex Bot.


MoviePedia 
==========

Moviepedia ChatBot 
==================

Moviepedia Bot is a chat bot that helps you query information about a
movie of your choice. We will be using AWS Lambda, which supports either
of Node (0.10 or 4.3), Python (2.7), or Java (8) runtimes. This bot has
been written in NodeJS and utilizes.
[OMDB](https://github.com/misterhat/omdb) for quering movies and
returing desired information.

Steps to build the Moviepedia Bot 
---------------------------------

Step 1: Create the AWS Lambda function 
--------------------------------------

Use this end point to upload the lambda code from s3:
https://s3-us-west-2.amazonaws.com/re-invent-botworkshop/samples/moviePedia/moviePedia.zip

Instructions: 
-------------

Zip the code that you downloaded. Note compress the files together not
the folder. Now, go to AWS Lambda console. Create a new lambda function.
Select "Blank Function" as a blueprint. in "Configure triggers" section
press next. Now configure your lambda function.

##### Configure Function: 

      1. Name your lambda function : moviePediaLogic
      2. Add Description - Lambda function for Moviepedia bot logic
      3. Runtime - Node.js4.3
      4. Code Entry - Upload the zip you downloaded
      5. Handler Section - Leave as default
      6. Select an existing role -  lambda_basic_execution
      4. Set time to 30 secs

#### 5. Test your lambda function. 

Configure the following test event to test your lambda function.

    {
    "messageVersion": "1.0",
    "invocationSource": "FulfillmentCodeHook",
    "userId": "user-1",
    "sessionAttributes": {},
    "bot": {
    "name": "movieInfoApp",
    "alias": "$LATEST",
    "version": "$LATEST"
    },
    "outputDialogMode": "Text",
    "currentIntent": {
    "name": "movieInfo",
    "slots": {
      "name": "Suicide Squad",
      "summary": "Director"
      },
    "confirmationStatus": "None"
     }
    }

#### The output should look like this: 

    {
     "sessionAttributes": {},
     "dialogAction": {
     "type": "Close",
     "fulfillmentState": "Fulfilled",
     "message": {
       "contentType": "PlainText",
       "content": "Director of Suicide Squad is/are: David Ayer"
       }
     }
    }

Step 2: Creating your Bot 
-------------------------

#### Create Amazon Lex IAM Role: lex-exec-role 

Go to Identity and Access Management (IAM) console. In role name, use a
name that is unique within your AWS account (for example,
lex-exec-role).

In Select Role Type, choose AWS Service Roles, and then choose AWS
Lambda.

Note In the current implementation, Amazon Lex service role is not
available. Therefore, you first create a role using the AWS Lambda as
the AWS service role. After you create the role, you update the trust
policy and specify Amazon Lex as the service principal to assume the
role. In Attach Policy, choose Next Step (that is, you create a role
without any permissions).

Choose the role you created and update policies as follows:

In the Permissions tab, choose Inline Policies, and then attach the
following custom policy.

    { 
    "Version": "2012-10-17", 
    "Statement": [ 
    { 
      "Action": [ 
        "lambda:InvokeFunction"
      ], 
      "Effect": "Allow", 
      "Resource": "*" 
      } 
     ] 
    }

In the Trust Relationships tab, choose Edit Trust Relationship, and
specify the Amazon Lex service principal ("lex.amazonaws.com"). The
updated policy should look as shown:

    {
     "Version": "2012-10-17",
     "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lex.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
      }
     ]
    }

#### 1. Create Amazon Lex Bot 

Go to Amazon Lex console on create your Amazon lex bot page. Select
custom app and provide the following information, then choose Create.

###### Remember to use a unique name for your bot 

##### Provide The Following Information: 

      1. Bot Name: moviePediaInfo
      2. Choose an output voice - Salli
      3. Set Session Timeout - 5 mins
      4. Add AMazon lex basic role to your Bot app - lex-exec-role

![MacDown Screenshot](https://s3-us-west-2.amazonaws.com/re-invent-botworkshop/website/CreateBot.png)

Step 3: Creating your Bot Conversations 
---------------------------------------

#### 2. Create Slots

In this section you create the two slots types for our ChatBot.

###### Remember to use a unique name for your slots 

##### Create your First slot 

Our first slot type is for the user to input a movie name he wants to
inquire on.

     Slot Type Name : moviePediaInfomovieName 

![MacDown Screenshot](https://s3-us-west-2.amazonaws.com/re-invent-botworkshop/website/SlotType1_moviePedia.png)

##### Configure your first slot 

Click on the slot type you created in the previous step and then add
description to your slot type. Let's add in some sample movie names as
values here.


##### Save your first slot 

Now that you have configured your Slot save your Slot configuration.

##### Create your second slot 

Our second slot type is for the user to input what information is he
looking for. In this example, our lambda function where the bot logic
sits is quering omdb to return values for ratings, votes, actors, plot,
director, year of release.

     Slot Type Name : moviePediaInfomovieDetails 

###### Remember to use a unique name for your slots. 

![MacDown Screenshot](https://s3-us-west-2.amazonaws.com/re-invent-botworkshop/website/sloyType2.png)

##### Configure your second slot 

Click on the slot type you created in the previous step and then add
description to your slot type. Let's add in values for our queries here.

##### Save your Second slot 

Now that you have configured your Slot save your Slot configuration.

![MacDown Screenshot](https://s3-us-west-2.amazonaws.com/re-invent-botworkshop/website/Slot2_Configure.png)

#### 3. Create Intent 

Intents help us map our conversations to our slots. Our MoviePedia
Chatbox requires creation of a single intent.

![MacDown Screenshot](https://s3-us-west-2.amazonaws.com/re-invent-botworkshop/website/Intent.png)

#### 4. Configure Intent 

Configure some sample utterances for you to start interacting with the
bot.

##### Sample Utterances: 

      1. Hi
      2. Hello Moviepedia
      3. Tell me about a movie
      4. Tell me about a {name}

![MacDown Screenshot](https://s3-us-west-2.amazonaws.com/re-invent-botworkshop/website/Sample_Utterances.png)

##### Map Slots 

Add the following name, slot type and prompt for our ChatBot. Note the
sequence. Enter the values for the slot type corresponding to moviename
first.

##### Enter: 

  Name   Slot Type                 Prompt
  ------ ------------------------- -----------------------------------------------------------------------
  name   moviePediaInfomovieName   Welcome to MoviePedia! Confirm the movie name you want to know about?

  Name      Slot Type                    Prompt
  --------- ---------------------------- -----------------------------------------------------------------------------------------
  summary   moviePediaInfomovieDetails   What information are you looking for? Year, Actors, Plot, Rating, Votes, Director, All?

###### Remember check the checkbox as both are slots are required for our ChatBot {#toc_30}

![MacDown Screenshot](https://s3-us-west-2.amazonaws.com/re-invent-botworkshop/website/SlotIntent_Mapping.png)

##### Add Lambda to the Intent 

We need to link our Chatbot to the lambda function. Type in an
appropiate goodbye message for your users.

![MacDown Screenshot](https://s3-us-west-2.amazonaws.com/re-invent-botworkshop/website/Lambda_Mapping.png)

##### Save The Intent 

Now that you have configured your Intent scroll up and save your Intent
configuration.

##### Error Handling

We will be customizing the error message for our bot users. Click on
error handling. You will notice there are default values set there.
Delete the default values and add in a customized message like. Add this
to the `Prompts` section:

`Welcome to Moviepedia. Type "Tell me about a movie"`

![MacDown Screenshot](https://s3-us-west-2.amazonaws.com/re-invent-botworkshop/website/ErrorHandling.png)

#### Step 4. Build 

Once you have configured your moviePedia chatbot. Click on build to
build your chatbot.

![MacDown Screenshot](https://s3-us-west-2.amazonaws.com/re-invent-botworkshop/website/Build.png)

#### Step 5. Test App 

Your browser does not support the video tag.

As, the build suceeds it's time for you to test the chatbot.

#### Step 6. Publish App 

Once your Bot is build and tested the next step is to publish our Bot
and make it avaialble on Slack, Facebook etc. In this example we will be
deploying our Bot on Facebook. To publish your Bot you need to create an
Alias. In this example we create an alias for "prod".

![MacDown Screenshot](https://s3-us-west-2.amazonaws.com/re-invent-botworkshop/website/publish.png)



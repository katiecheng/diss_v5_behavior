/*
TODO
- useful functions:
-- building a questionnaire
-- questionnaire validation; e.g. test if a number is between x and y
Once I'm done testing
- Add feedback collection
- check for duplicate prolificIds, so it doesn't overwrite data in database
- add database rules! If I include a path in my prolific id, I can overwrite data
- check to see that the first item presented is really 5 seconds
- progress bar for each round of 20 words
- giving credit for plural
- clean up this file...
- collect start/end times for duration
- collect individual word accuracy data during study and test
- update conditions!
- change the trial order to be experiment specific?
- decide trial duration (study vs. strategy vs. test)
*/

// access and get a reference to the Firebase database service
var db = firebase.database();

// ## Helper functions

// Shows slides. 
function showSlide(id) {
    $(".slide").hide(); // Hide all slides
    $("#"+id).show();   // Show just the slide we want to show
}

// Get a random integer less than n.
function randomInteger(n) {
  return Math.floor(Math.random()*n);
}

// Fisher-Yates (aka Knuth) Shuffle (https://github.com/coolaj86/knuth-shuffle)
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;
  // While there remain elements to shuffle...
  while (currentIndex > 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex --;
    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}


function validateProlificId() {
  var prolificId = $("#prolificId").val();
  if (prolificId == "") {
    alert("Prolific ID cannot be blank");
    return false;
  } else {
    return true;
  }
}

/*
TODO want to check for duplicate Prolific IDs to prevent overwrites
The fn as written doesn't work because async processing leads fn not to evaluate sequentially
Need to implement some kind of callback

// ref.child("users").orderByChild("ID").equalTo("U1EL5623").once("value",snapshot => {
//     if (snapshot.exists()){
//       const userData = snapshot.val();
//       console.log("exists!", userData);
//     }
// });

// //every user must have an email
// firebase.database().ref(`users/${userId}/email`).once("value", snapshot => {
//    if (snapshot.exists()){
//       console.log("exists!");
//       const email = snapshot.val();
//     }
// });

function validateProlificId() {
  var prolificId = $("#prolificId").val();
  // var ref = db.ref("users/");
  var ref = db.ref(`users/${prolificId}`);
  console.log("I'm before the snapshot")
  returnval = false;
  ref.once("value", snapshot => {
    if (prolificId == "") {
      console.log("I'm in the blank")
      alert("Prolific ID cannot be blank");
      returnval= false;
    } else if (snapshot.exists()){
      console.log("I'm in the duplicate")
      alert("Duplicate Prolific ID. If you have already participated in this experiment, you cannot participate again. If you think you are seeing this message in error, please contact the researcher.");
      returnval= false;
    } else {
      console.log("I'm in the else")
      returnval= true;
    }
  });
  console.log(returnval);
  // ref.once("value")
  //   .then(function(snapshot) { // get a snapshot of the value at "users/"
  //     var prolificIdExists = snapshot.child(prolificId).exists(); // boolean
  //     if (prolificId == "") {
  //       console.log("I'm in the blank")
  //       alert("Prolific ID cannot be blank");
  //       return false;
  //     } else if (prolificIdExists) {
  //       console.log("I'm in the duplicate")
  //       alert("Duplicate Prolific ID. If you have already participated in this experiment, you cannot participate again. If you think you are seeing this message in error, please contact the researcher.");
  //       return false;
  //     } else {
  //       console.log("I'm in the else")
  //       return true;
  //     }
  //   });
  console.log("I'm past the snapshot")
  return returnval;
}
*/

// ## Interact with database

// Create a new user, with all columns that will have to be populated
function createNewUser(prolificId, startDateTime, condition) {
  db.ref('users/' + prolificId).set({
    prolificId: prolificId,
    startDateTime: startDateTime.toISOString(),
    endDateTime: "", 
    condition: condition,

    interventionPredictRestudy: "",
    interventionPredictRestudyReason: "",
    interventionPredictGenerate: "",
    interventionPredictGenerateReason: "",

    interventionStrategyRestudyScoreRound1: "",
    interventionStrategyGenerateScoreRound1: "",
    interventionStrategyRestudyScoreRound2: "",
    interventionStrategyGenerateScoreRound2: "",

    interventionTestRestudyScore: "",
    interventionTestGenerateScore: "",
    interventionFeedbackSurprise: "",
    assessmentTestScore: "",

    effectivenessRestudy : "",
    effortRestudy : "",
    howManyRestudy : "",
    effectivenessGenerate : "",
    effortGenerate : "",
    howManyGenerate : "",  
    chosenStrategy : "",
    effectivenessChosenStrategy : "",
    effortChosenStrategy : "",
    effort : "",

    comments : ""
  });
}

function updateUserPredictions(prolificId, predictRestudy, predictRestudyReason,
  predictGenerate, predictGenerateReason){
  db.ref('users/' + prolificId).update({
    interventionPredictRestudy : predictRestudy,
    interventionPredictRestudyReason : predictRestudyReason,
    interventionPredictGenerate : predictGenerate,
    interventionPredictGenerateReason : predictGenerateReason
  });
}

function updateUserStrategyScores(prolificId, round, interventionStrategyRestudyScore, interventionStrategyGenerateScore) {
  if (round == 1) {
    db.ref('users/' + prolificId).update({
      interventionStrategyRestudyScoreRound1: interventionStrategyRestudyScore,
      interventionStrategyGenerateScoreRound1: interventionStrategyGenerateScore
    });
  } else if (round == 2) {
    db.ref('users/' + prolificId).update({
      interventionStrategyRestudyScoreRound2: interventionStrategyRestudyScore,
      interventionStrategyGenerateScoreRound2: interventionStrategyGenerateScore
    });
  }
}

function updateUserInterventionTestScores(prolificId, restudyScore, generateScore){
  db.ref('users/' + prolificId).update({
    interventionTestRestudyScore: restudyScore,
    interventionTestGenerateScore: generateScore
  });
}

function updateUserFeedbackSurprise(prolificId, feedbackSurprise){
  db.ref('users/' + prolificId).update({
    interventionFeedbackSurprise: feedbackSurprise
  });
}

function updateUserAssessmentTestScore(prolificId, assessmentScore) {
  db.ref('users/' + prolificId).update({
    assessmentTestScore : assessmentScore
  });
}

function updateUserQuestionnaire(prolificId, effectivenessRestudy, effortRestudy, howManyRestudy, 
        effectivenessGenerate, effortGenerate, howManyGenerate,
        chosenStrategy, effectivenessChosenStrategy, effortChosenStrategy, effort){
  db.ref('users/' + prolificId).update({
    effectivenessRestudy : effectivenessRestudy,
    effortRestudy : effortRestudy,
    howManyRestudy : howManyRestudy,
    effectivenessGenerate : effectivenessGenerate,
    effortGenerate : effortGenerate,
    howManyGenerate : howManyGenerate,  
    chosenStrategy : chosenStrategy,
    effectivenessChosenStrategy : effectivenessChosenStrategy,
    effortChosenStrategy : effortChosenStrategy,
    effort : effort
  });
}

function updateUserComments(prolificId, comments) {
  db.ref('users/' + prolificId).update({
    comments : comments
  });
}

function updateUserEndDateTime(prolificId, endDateTime) {
  db.ref('users/' + prolificId).update({
    endDateTime : endDateTime.toISOString()
  });
}

// When you start a new session, create all items, with all the columns that will have to be populated
function createNewItem(prolificId, itemIndex, swahili, english) {
  db.ref('items/' + prolificId + "_" + itemIndex).set({
    prolificId: prolificId,
    itemIndex: itemIndex,
    itemSwahili: swahili,
    itemEnglish: english,
    
    interventionStudyOrder: "",
    interventionStrategyOrder: "",
    interventionTestOrder: "",
    interventionTestUserInput: "",
    interventionTestAccuracy: "",

    interventionStrategy: "",
    interventionStrategyUserInputRound1: "",
    interventionStrategyAccuracyRound1: "",
    interventionStrategyUserInputRound2: "",
    interventionStrategyAccuracyRound2: "",

    assessmentStudyOrder: "",
    assessmentStrategyOrder: "",
    assessmentTestOrder: "",
    assessmentTestUserInput: "",
    assessmentTestAccuracy: "",

    assessmentStrategy: "",
    assessmentStrategyRevealLatency: "",
    assessmentStrategyMoveOnLatency: "",
  });
}

function updateItemStudyOrderData(prolificId, itemIndex, studyOrder, stage){
  if (stage == "intervention") {
    db.ref('items/' + prolificId + "_" + itemIndex).update({
      interventionStudyOrder: studyOrder
    });
  } else if (stage == "assessment") {
    db.ref('items/' + prolificId + "_" + itemIndex).update({
      assessmentStudyOrder: studyOrder
    });
  }
}

function updateItemStrategyOrderData(prolificId, itemIndex, strategyOrder, stage){
  if (stage == "intervention") {
    db.ref('items/' + prolificId + "_" + itemIndex).update({
      interventionStrategyOrder: strategyOrder
    });
  } else if (stage == "assessment") {
    db.ref('items/' + prolificId + "_" + itemIndex).update({
      assessmentStrategyOrder: strategyOrder
    });
  }
}

function updateItemTestOrderData(prolificId, itemIndex, testOrder, stage){
    if (stage == "intervention") {
      db.ref('items/' + prolificId + "_" + itemIndex).update({
        interventionTestOrder: testOrder
      });
    } else if (stage == "assessment") {
      db.ref('items/' + prolificId + "_" + itemIndex).update({
        assessmentTestOrder: testOrder
      });
    }
}

function updateItemStrategyData(prolificId, itemIndex, interventionStrategy, round, userInput, accuracy){
  if (round == 1) {
      db.ref('items/' + prolificId + "_" + itemIndex).update({
        interventionStrategy: interventionStrategy,
        interventionStrategyUserInputRound1: userInput,
        interventionStrategyAccuracyRound1: accuracy
      });
  } else if (round == 2) {
      db.ref('items/' + prolificId + "_" + itemIndex).update({
        interventionStrategyUserInputRound2: userInput,
        interventionStrategyAccuracyRound2: accuracy
      });
  }
}

function updateItemTestAccuracyData(prolificId, itemIndex, testAccuracy, userInput, stage){
  if (stage == "intervention") {
    db.ref('items/' + prolificId + "_" + itemIndex).update({
      interventionTestAccuracy: testAccuracy,
      interventionTestUserInput: userInput
    });
  } else if (stage == "assessment") {
    db.ref('items/' + prolificId + "_" + itemIndex).update({
      assessmentTestAccuracy: testAccuracy,
      assessmentTestUserInput: userInput
    });
  }
}

function updateItemStrategyRevealData(prolificId, itemIndex, assessmentStrategy, revealLatency){
  db.ref('items/' + prolificId + "_" + itemIndex).update({
    assessmentStrategy: assessmentStrategy,
    assessmentStrategyRevealLatency: revealLatency
  });
}

function updateItemStrategyMoveOnData(prolificId, itemIndex, assessmentStrategy, moveOnLatency){
  db.ref('items/' + prolificId + "_" + itemIndex).update({
    assessmentStrategy: assessmentStrategy,
    assessmentStrategyMoveOnLatency: moveOnLatency
  });
}

function getCondition(){
  var conditionsArray,
    participantIndex
  var promise = db.ref('conditions/').once("value").then(function(snapshot){
    var val = snapshot.val();

    if (val) {
      participantIndex = parseInt(val.participantIndex);
      conditionsArray = val.conditionsArray;
      if (participantIndex < conditionsArray.length-1){
        condition = conditionsArray[participantIndex];
      } else {
        // just in case needed to add more participants beyond the generated list
        condition = randomInteger(2);
      }
    } else {
      // just in case conditions not generated, randomly assign a condition
      condition = randomInteger(2);
    }
  });

  promise.then(snapshot => {
    // console.log(conditionsArray, participantIndex, condition)
    participantIndex++;
    db.ref('conditions/').update({
      participantIndex: participantIndex
    });
    runExpt();
    // Show the instructions slide -- this is what we want subjects to see first.
    showSlide("getProlificId");

    // test prediction slide
    // experiment.interventionPredict(); 
    // showSlide("predictNext");

    // test feedback slides
    // experiment.controlFeedback(); 
    // experiment.interventionFeedback(); 
    // showSlide("feedbackNext");

    // test questionnaire slides
    // experiment.questionnaire(); 
    // showSlide("questionnaire");
  });
}

function processUserInput(userInput){
  return userInput.toLowerCase().trim().replace(/[!"#$%&'()*+,-.:;<=>?@^_`{|}~]/g,"")
}

// ## Configuration settings
var experiment = "",
  /* toggle numTrials for testing*/
  numTrials = 40, // full 40 items
  /* test intervention with first numTrials items, in case need to re-test people */
  // numTrials = 10, // testing
  trialDuration = 5000,
  feedbackDuration = 1000, 
  bgcolor = "white",
  /* toggle test 1 or 2 strategy rounds */
  numStrategyRounds = 1,
  /* toggle number of conditions */
  // condition = randomInteger(4), // 2x2
  condition = -1, // 1 expt vs. 0 control
  // condition = 2, // fixed to expt?
  /* toggle intervention prediction order */
  predictRestudyFirst = randomInteger(2), // 1 or 0
  myTrialOrder = shuffle([...Array(numTrials).keys()]),
  /* toggle intervention/assessment trials to test intervention */
  // interventionTrials = myTrialOrder.slice(0),
  // assessmentTrials = [],
  /* toggle intervention/assessment trials to test assessment */
  // interventionTrials = [],
  // assessmentTrials = myTrialOrder.slice(0),
  /* test intervention with last numTrials items */
  /* test intervention with the first (slice) items */
  // myTrialOrder = shuffle([...Array(40).keys()].slice(0,3)),
  /* full intervention with all 40 */
  interventionTrials = myTrialOrder.slice(0,(numTrials/2)),
  assessmentTrials = myTrialOrder.slice((numTrials/2), numTrials),
  swahili_english_pairs = [
    ["adhama", "honor"],
    ["adui", "enemy"],
    ["bustani", "garden"],
    ["buu", "maggot"],
    ["chakula", "food"],
    ["dafina", "treasure"],
    ["elimu", "science"],
    ["embe", "mango"],
    ["fagio", "broom"],
    ["farasi", "horse"],
    ["fununu", "rumor"],
    ["godoro", "mattress"],
    ["goti", "knee"],
    ["hariri", "silk"],
    ["kaa", "crab"],
    ["kaburi", "grave"],
    ["kaputula", "shorts"],
    ["leso", "scarf"],
    ["maiti", "corpse"],
    ["malkia", "queen"],
    ["mashua", "boat"],
    ["ndoo", "bucket"],
    ["nyanya", "tomato"],
    ["pazia", "curtain"],
    ["pipa", "barrel"],
    ["pombe", "beer"],
    ["punda", "donkey"],
    ["rembo", "ornament"],
    ["roho", "soul"],
    ["sala", "prayer"],
    ["sumu", "poison"],
    ["tabibu", "doctor"],
    ["theluji", "snow"],
    ["tumbili", "monkey"],
    ["usingizi", "sleep"],
    ["vuke", "steam"],
    ["yai", "egg"],
    ["zeituni", "olives"],
    ["ziwa", "lake"],
    ["zulia", "carpet"]
  ];

var wait = document.getElementById("wait"),
  wait2 = document.getElementById("wait2"),
  wait3 = document.getElementById("wait3"),
  wait4 = document.getElementById("wait4");

var dots = window.setInterval( function() {
    wait.innerHTML += ".";
    wait2.innerHTML += ".";
    wait3.innerHTML += ".";
    wait4.innerHTML += ".";
  }, 1000);


// ## The main event
function runExpt(){
  /* I implement the sequence as an object with properties and methods. The benefit of encapsulating everything in an object is that it's conceptually coherent (i.e. the <code>data</code> variable belongs to this particular sequence and not any other) and allows you to **compose** sequences to build more complicated experiments. For instance, if you wanted an experiment with, say, a survey, a reaction time test, and a memory test presented in a number of different orders, you could easily do so by creating three separate sequences and dynamically setting the <code>end()</code> function for each sequence so that it points to the next. **More practically, you should stick everything in an object and submit that whole object so that you don't lose data (e.g. randomization parameters, what condition the subject is in, etc). Don't worry about the fact that some of the object properties are functions -- mmturkey (the Turk submission library) will strip these out.*/
  experiment = {
    prolificID: "",
    /* Properties */
    numTrials: numTrials,
    numStrategyRounds: numStrategyRounds,
    /* Toggle for random or manual condition */
    condition: condition,
    // condition: 1, // manual
    myTrialOrder: myTrialOrder, // already shuffled
    trialDuration: trialDuration,
    feedbackDuration: feedbackDuration,
    predictRestudyFirst: predictRestudyFirst,

    /* interventionTrials is the first half of myTrialOrder */
    interventionStudyTrials: shuffle(interventionTrials.slice(0)), // study order
    interventionStrategyTrials1: shuffle(interventionTrials.slice(0)), // strategy order 1
    interventionStrategyTrials2: shuffle(interventionTrials.slice(0)), // strategy order 2
    interventionRestudyTrials: interventionTrials.slice((interventionTrials.length/2), interventionTrials.length),
    interventionGenerateTrials: interventionTrials.slice(0,(interventionTrials.length/2)),
    interventionRestudyTrialsSave: [],
    interventionGenerateTrialsSave: [],
    interventionTestTrials: shuffle(interventionTrials.slice(0)), // test order


    /* assessmentTrials is the second half of myTrialOrder */
    assessmentStudyTrials: shuffle(assessmentTrials.slice(0)),
    // assessmentStrategyTrials: assessmentTrials.slice(0),
    /* TOGGLE for pilot latency vs. assessment */
    assessmentChoiceTrials: shuffle(assessmentTrials.slice(0)),
    assessmentChoiceTrialsSave: [],
    // assessmentChoiceTrials: assessmentTrials.slice(0,assessmentTrials.length/3),
    // assessmentRestudyTrials: assessmentTrials.slice(assessmentTrials.length/3,(assessmentTrials.length/3*2)),
    // assessmentGenerateTrials: assessmentTrials.slice((assessmentTrials.length/3*2), assessmentTrials.length),
    // assessmentChoiceTrialsSave: [],
    assessmentRestudyTrialsSave: [],
    assessmentGenerateTrialsSave: [],
    assessmentTestTrials: shuffle(assessmentTrials.slice(0)),

    /* aggregate scores and outcomes */
    interventionStudyOrderCounter: 0,
    interventionStrategyOrderCounter: 0,
    interventionStrategyRestudyScoreRound1: 0,
    interventionStrategyGenerateScoreRound1: 0,
    interventionStrategyRestudyScoreRound2: 0,
    interventionStrategyGenerateScoreRound2: 0,
    predictionRestudy: -1,
    predictionGenerate: -1,
    predictionRestudyReason: "",
    predictionGenerateReason: "",
    interventionTestOrderCounter: 0,
    interventionTestRestudyScore: 0,
    interventionTestGenerateScore: 0,
    interventionFeedbackSurprise: "",
    assessmentStudyOrderCounter: 0,
    assessmentStrategyOrderCounter: 0,
    assessmentTestOrderCounter: 0,
    assessmentTestScore: 0,
    // totalScore: 0,
    // bonusPayment: 0,

    /* alert tracking */
    validatePredictionFormAlerted: false,
    validateFeedbackSurpriseAlerted: false,
    validateQuestionnaireAlerted: false,

    // Instructions
    instructions: function() {
      if (validateProlificId()){
        experiment.prolificId = $("#prolificId").val();
        var startDateTime = new Date();
        createNewUser(experiment.prolificId, startDateTime, experiment.condition);
        for (i=0; i<experiment.myTrialOrder.length; i++) {
          createNewItem(experiment.prolificId, 
            i,
            swahili_english_pairs[i][0],
            swahili_english_pairs[i][1]);
        }
        /* toggle instructions slide */
        // showSlide("instructionsLatency");
        showSlide("instructionsExpt");
      }
    },

    //Intro to study
    interventionStudyFraming: function() { 
      var header = "Round 1: Presentation phase";
      var text1 = "In a moment, you will be presented with 20 Swahili words paired with \
      their English translations. You will see each Swahili-English word pair \
      for 5 seconds, and then the screen will automatically advance to the \
      next pair. Pay attention, and study each pair so you can type \
      the English translation given the Swahili word."
      var text2 = "Please make sure you understand these instructions before you begin.";
      showSlide("textNext");
      $("#instructionsHeader").html(header);
      $("#instructionsText1").html(text1);
      $("#instructionsText2").html(text2);
      $("#nextButton").click(function(){$(this).blur(); experiment.interventionStudy();});
      // console.log($("#instructionsText").html());
    },

    // 20 items, View each item for 5 sec
    interventionStudy: function() {

      var trials = experiment.interventionStudyTrials;
      if (trials.length == 0) {
        experiment.interventionStrategyFraming(1);
        return;
      }
      var currItem = parseInt(trials.shift()),
        swahili = swahili_english_pairs[currItem][0],
        english = swahili_english_pairs[currItem][1];

      experiment.interventionStudyOrderCounter += 1;
      updateItemStudyOrderData(experiment.prolificId, currItem, experiment.interventionStudyOrderCounter, "intervention");

      wait.innerHTML = "";
      wait2.innerHTML = "";
      wait3.innerHTML = "";
      wait4.innerHTML = "";
      showSlide("study");

      $("#wordpair").html(swahili + " : " + english);
      setTimeout(function(){experiment.interventionStudy()}, trialDuration);
    },

    //Intro to strategy
    interventionStrategyFraming: function(round) {
      if (experiment.predictRestudyFirst){
        // predict restudy first, then predict generate
        var firstStratText = "<b>Reviewing</b> the English translation by copying it into a textbox";
        var secondStratText = "<b>Recalling</b> the English translation from memory";
      } else {
        // predict generate first, then predict restudy
        var firstStratText = "<b>Recalling</b> the English translation from memory";
        var secondStratText = "<b>Reviewing</b> the English translation by copying it into a textbox";
      }
      if (round == 1) {
        /* Toggle for one or two strategy rounds */
        var header = "Round 1: Learning phase";
        // var header = "Study - Round 1";
        var text1 = "Now you will be asked to study each Swahili-English word pair either by:\
                  <ol>\
                  <li>firstStratText</li>\
                  <li>secondStratText</li>\
                  </ol>\
                  After 5 seconds, the screen will automatically advance and save your input. \
                  <br><br>\
                  For the cases that you try to <b>recall</b> the translation from memory, \
                  you will get to see the correct answer at the end of the 5 seconds. \
                  If you were correct, the answer will be shown in <b><font color='green'>green</font></b>, \
                  if incorrect, the answer will be shown in <b><font color='red'>red</font></b>.";
        var text1replaced = text1.replace(
          "firstStratText", firstStratText).replace(
          "secondStratText", secondStratText);
        var text2 = "Please make sure you understand these instructions before you begin."
      } else if (round == 2) { //TODO update formatting
        var header = "Round 1: Learning phase, repeated";
        var text1 = "Now, you will be asked to study each Swahili-English word pair again, \
                  either by (1) \
                  reviewing the English translation by copying it into the textbox, or (2) trying to \
                  recall the English translation from memory. For each word pair, if you copied \
                  in the first study round, you will be asked to copy again; if you tried to recall in the \
                  first study round, you will be asked to recall again. After 5 seconds,\
                  the screen will automatically advance and save your input. For the cases that you \
                  try to recall the translation from memory, you will get to see the correct answer. \
                  If you were correct, the answer will be <b><font color='green'>green</font></b>, \
                  if incorrect, the answer will be <b><font color='red'>red</font></b>.";
        var text2 = "Please make sure you understand these instructions before you begin."
      }
      showSlide("textNext");
      $("#instructionsHeader").html(header);
      // $("#instructionsText1").html(text1);
      $("#instructionsText1").html(text1replaced);
      $("#instructionsText2").html(text2);
      $("#nextButton").click(function(){$(this).blur(); experiment.interventionStrategy(round);});
      // console.log($("#instructionsText1").html());
    },

    //Apply strategy to each item for 5 sec 1/2 copy 1/2 generate (randomize)
    interventionStrategy: function(round) {
      // console.log("interventionStrategyTrials1: ", experiment.interventionStrategyTrials1);
      // console.log("interventionStrategyTrials2: ", experiment.interventionStrategyTrials2);
      if (round == 1) {
        var trials = experiment.interventionStrategyTrials1;
        if (trials.length == 0) {
          updateUserStrategyScores(experiment.prolificId, round, 
            experiment.interventionStrategyRestudyScoreRound1, 
            experiment.interventionStrategyGenerateScoreRound1);
          if (numStrategyRounds == 1){experiment.interventionPredict();
          } else if (numStrategyRounds == 2) {experiment.interventionStrategyFraming(2);
          } return;
        } 
      } else if (round == 2) {
        var trials = experiment.interventionStrategyTrials2;
        if (trials.length == 0) {
          updateUserStrategyScores(experiment.prolificId, round, 
            experiment.interventionStrategyRestudyScoreRound2, 
            experiment.interventionStrategyGenerateScoreRound2);
          experiment.interventionPredict(); return;
        } 
      }
      var currItem = parseInt(trials.shift()),
        swahili = swahili_english_pairs[currItem][0],
        english = swahili_english_pairs[currItem][1],
        generateItem = ($.inArray(currItem, experiment.interventionGenerateTrials) != -1),
        restudyItem = ($.inArray(currItem, experiment.interventionRestudyTrials) != -1);

      // console.log(currItem);
      // console.log(swahili);
      // console.log(english);

      experiment.interventionStrategyOrderCounter += 1;
      updateItemStrategyOrderData(experiment.prolificId, currItem, experiment.interventionStrategyOrderCounter, "intervention");

      wait.innerHTML = "";
      wait2.innerHTML = "";
      wait3.innerHTML = "";
      wait4.innerHTML = "";
      if (generateItem) {
        experiment.interventionGenerateTrialsSave.push(currItem);
        showSlide("generate");
        $("#swahili").html(swahili + " : ");
        $("#generatedWord").val('');
        $("#generatedWord").focus();
        setTimeout(function(){
          $("#generatedForm").submit(experiment.captureInterventionStrategyWord("generate", round, currItem, swahili, english));
        }, trialDuration-feedbackDuration); 
      } else if (restudyItem) {
        experiment.interventionRestudyTrialsSave.push(currItem);
        showSlide("restudy");
        $("#restudyWordpair").html(swahili + " : " + english);
        $("#restudySwahili").html(swahili + " : ");
        $("#restudiedWord").val('');
        $("#restudiedWord").focus();
        setTimeout(function(){
          $("#restudiedForm").submit(experiment.captureInterventionStrategyWord("restudy", round, currItem, swahili, english));
        }, trialDuration); 
      }
    },

    captureInterventionStrategyWord: function(strategy, round, currItem, swahili, english) {
      if (strategy == "generate"){
        var userInput = processUserInput($("#generatedWord").val());
      } else if (strategy == "restudy"){
        var userInput = processUserInput($("#restudiedWord").val());
      }

      // console.log(userInput)
      
      var accuracy = english == userInput ? 1 : 0;

      if (strategy == "generate"){
        if (round == 1){
          experiment.interventionStrategyGenerateScoreRound1 += accuracy;
        } else if (round == 2) {
          experiment.interventionStrategyGenerateScoreRound2 += accuracy;
        }
        experiment.interventionGenerateFeedback(round, swahili, english, accuracy);
      } else if (strategy == "restudy"){
        if (round == 1){
          experiment.interventionStrategyRestudyScoreRound1 += accuracy;
        } else if (round == 2) {
          experiment.interventionStrategyRestudyScoreRound2 += accuracy;
        }
        experiment.interventionStrategy(round);
      } 
      updateItemStrategyData(experiment.prolificId, currItem, strategy, round, userInput, accuracy);
      return false; // stop form from being submitted
    },

    //show feedback
    interventionGenerateFeedback: function(round, swahili, english, accuracy) {
      $("#feedback").show();
      $("#feedback").html(swahili + " : " + english);
      if (accuracy == 1){
        $("#feedback").css("color", "green");
      } else {
        $("#feedback").css("color", "red");
      }
      setTimeout(function(){
        $("#feedback").hide();
        experiment.interventionStrategy(round);}, feedbackDuration); 
    },

    // ask for prediction
    interventionPredict: function() {
      var restudyPredictionText = `For ${experiment.numTrials/4} of these Swahili-English word pairs, you studied using  
      the <b>review</b> strategy--you reviewed the English translation by copying it 
      into the textbox. Out of these ${experiment.numTrials/4}, how many English translations do you 
      think you’ll remember on the quiz?`;
      
      var generatePredictionText = `For ${experiment.numTrials/4} of these Swahili-English word pairs, you studied using 
      the <b>recall</b> strategy--you tried to recall the English translation 
      from memory. Out of these ${experiment.numTrials/4}, how many English translations do you 
      think you’ll remember on the quiz?`;
      
      if (experiment.predictRestudyFirst){
        // predict restudy first, then predict generate
        var firstPredictionText = restudyPredictionText;
        var secondPredictionText = generatePredictionText;
      } else {
        // predict generate first, then predict restudy
        var firstPredictionText = generatePredictionText;
        var secondPredictionText = restudyPredictionText;
      }

      showSlide("predictNext");
      $("#firstPredictionText").html(firstPredictionText);
      $("#secondPredictionText").html(secondPredictionText);
      $(".denominator").html(`/${experiment.numTrials/4}`);
      $("#predictNextButton").click(function(){$(this).blur(); 
        $("#predictionForm").submit(experiment.validatePredictionForm());
      })
    },

    validatePredictionForm: function(){
      var fail = false,
        errorLog = "";
      var firstPrediction = parseInt($("#firstPrediction").val()),
        secondPrediction = parseInt($("#secondPrediction").val()),
        firstPredictionReason = $("#firstPredictionReason").val(),
        secondPredictionReason = $("#secondPredictionReason").val();
      
      if (!(firstPrediction >= 0 & firstPrediction <= experiment.numTrials/4 &
            secondPrediction >= 0 & secondPrediction <= experiment.numTrials/4)){
        errorLog += `We noticed that one or more of your predictions is not a number in the range from 0 to ${experiment.numTrials/4}. Please give us your best prediction in this range.\n\n`;
        fail = true;
      } 
      if (!$.trim($("#firstPredictionReason").val()) |
                 !$.trim($("#secondPredictionReason").val())) {
        errorLog += `We noticed that you did not provide reasons for one or more of your predictions. Please share your reasoning.`;
        fail = true;
      } 
      if (fail) {
        if (!experiment.validatePredictionFormAlerted){
          alert(errorLog);
          // experiment.validatePredictionFormAlerted = true; // toggle to allow empty
        } else { 
          experiment.capturePrediction(firstPrediction, firstPredictionReason,
            secondPrediction, secondPredictionReason);
        }
      } else { 
        experiment.capturePrediction(firstPrediction, firstPredictionReason,
          secondPrediction, secondPredictionReason);
      }
    },

    capturePrediction: function(firstPrediction, firstPredictionReason,
      secondPrediction, secondPredictionReason) {
      if (experiment.predictRestudyFirst){
        var predictRestudy = firstPrediction,
          predictRestudyReason = firstPredictionReason,
          predictGenerate = secondPrediction,
          predictGenerateReason = secondPredictionReason;
      } else {
        var predictRestudy = secondPrediction,
          predictRestudyReason = secondPredictionReason,
          predictGenerate = firstPrediction,
          predictGenerateReason = firstPredictionReason;
      }
      experiment.predictionRestudy = predictRestudy;
      experiment.predictionGenerate = predictGenerate;
      experiment.predictionRestudyReason = predictRestudyReason;
      experiment.predictionGenerateReason = predictGenerateReason;
      updateUserPredictions(experiment.prolificId, predictRestudy, predictRestudyReason,
        predictGenerate, predictGenerateReason);
      experiment.interventionTestFraming();
      return false;
    },

    /*
    “Now, you will be shown each Swahili word again. You’ll have 10 seconds to type the 
    correct English translation.”
    */
    interventionTestFraming: function() {
      var header = "Round 1: Quiz phase"
      var text1 = "Let's see what you learned! Next, you will be shown each Swahili word again.\
        You’ll have 5 seconds to type the correct English translation. After 5 seconds,\
        the screen will automatically advance and save your input."
      var text2 = "Please make sure you understand these instructions before you begin."
      showSlide("textNext");
      $("#instructionsHeader").html(header);
      $("#instructionsText1").html(text1);
      $("#instructionsText2").html(text2);
      $("#nextButton").click(function(){$(this).blur(); experiment.interventionTest();});
      // console.log($("#instructionsText").html());
    },

    interventionTest: function(){
      var trials = experiment.interventionTestTrials;
      if (trials.length == 0) {
        updateUserInterventionTestScores(experiment.prolificId, 
          experiment.interventionTestRestudyScore, 
          experiment.interventionTestGenerateScore);
        if (experiment.condition){
          experiment.interventionFeedback(); 
        } else {
          experiment.controlFeedback();
        }
        return;
      } 

      // Get the current trial - <code>shift()</code> removes the first element of the array and returns it.
      var currItem = parseInt(trials.shift()),
        swahili = swahili_english_pairs[currItem][0],
        english = swahili_english_pairs[currItem][1];

      // console.log(currItem);
      // console.log(swahili);
      // console.log(english);

      experiment.interventionTestOrderCounter += 1;
      updateItemTestOrderData(experiment.prolificId, currItem, experiment.interventionTestOrderCounter, "intervention");

      wait.innerHTML = "";
      wait2.innerHTML = "";
      wait3.innerHTML = "";
      wait4.innerHTML = "";
      showSlide("test");
      $("#swahiliTest").html(swahili + " : ");
      $("#testedWord").val('');
      $("#testedWord").focus();

      // Wait 5 seconds before starting the next trial.
      setTimeout(
        function(){
          $("#testedForm").submit(experiment.captureInterventionTestWord(currItem, swahili, english));
        }, 
      trialDuration); 
    },

    captureInterventionTestWord: function(currItem, swahili, english) {
      var userInput = processUserInput($("#testedWord").val()),
        generateItem = ($.inArray(currItem, experiment.interventionGenerateTrialsSave) != -1),
        restudyItem = ($.inArray(currItem, experiment.interventionRestudyTrialsSave) != -1),
        accuracy = english == userInput ? 1 : 0;

      // console.log(userInput)
      
      if (generateItem){
          experiment.interventionTestGenerateScore += accuracy;
      } else if (restudyItem){
        experiment.interventionTestRestudyScore += accuracy;
      } 
      experiment.interventionTest();
      updateItemTestAccuracyData(experiment.prolificId, currItem, accuracy, userInput, "intervention");
      // experiment.interventionTestData.push(data);
    },
    
    controlFeedback: function(){
      var text = `Overall, you scored ${experiment.interventionTestGenerateScore + experiment.interventionTestRestudyScore} / ${experiment.numTrials/2} on the quiz.`
      
      showSlide("feedbackNext");
      $("#feedbackText").html(text);
      $("#firstFeedbackText").html("");
      $("#secondFeedbackText").html("");
      $("#feedbackNextButton").click(function(){$(this).blur(); experiment.interventionFeedbackSurprise()});
    },
    /*
    No strategy feedback: summative performance outcome
    “You scored a __ / 20!”

    Strategy feedback: Proof of utility
    “You scored a __ / 20!
    When using the recall strategy, you scored __ /10
    When using the review strategy, you scored __ /10
    */
    interventionFeedback: function() {
      
      var text = `Overall, you scored ${experiment.interventionTestGenerateScore + experiment.interventionTestRestudyScore} / ${experiment.numTrials/2} on the quiz.`
      var restudyFeedbackText = "On the items that you studied by <b>reviewing</b> the English translation by copying it into a textbox... \
      <ul>\
      <li>You predicted that you would score predictionRestudy/numTrialsDiv4.</li> \
      <li>The reason you provided for this prediction was: predictionRestudyReason</li>\
      <li>Your <u>actual score</u> when studying by <b>reviewing</b> was interventionTestRestudyScore/numTrialsDiv4.</li>\
      </ul>"
      var restudyFeedbackTextReplaced = restudyFeedbackText.replace(
        "predictionRestudy", experiment.predictionRestudy).replace(
        /numTrialsDiv4/g, experiment.numTrials/4).replace(
        "predictionRestudyReason", experiment.predictionRestudyReason).replace(
        "interventionTestRestudyScore", experiment.interventionTestRestudyScore)
      var generateFeedbackText = "On the items that you studied by <b>recalling</b> the \
      English translation from memory...\
      <ul>\
      <li>You predicted that you would score predictionGenerate/numTrialsDiv4.</li> \
      <li>The reason you provided for this prediction was: predictionGenerateReason</li>\
      <li>Your <u>actual score</u> when studying by <b>recalling</b> was interventionTestGenerateScore/numTrialsDiv4.</li>\
      </ul>"
      var generateFeedbackTextReplaced = generateFeedbackText.replace(
        "predictionGenerate", experiment.predictionGenerate).replace(
        /numTrialsDiv4/g, experiment.numTrials/4).replace(
        "predictionGenerateReason", experiment.predictionGenerateReason).replace(
        "interventionTestGenerateScore", experiment.interventionTestGenerateScore)


      if (experiment.predictRestudyFirst) {
        var firstFeedbackText = restudyFeedbackTextReplaced;
        var secondFeedbackText = generateFeedbackTextReplaced;
      } else {
        var firstFeedbackText = generateFeedbackTextReplaced;
        var secondFeedbackText = restudyFeedbackTextReplaced;
      }
      
      showSlide("feedbackNext");
      $("#feedbackText").html(text);
      $("#firstFeedbackText").html(firstFeedbackText);
      $("#secondFeedbackText").html(secondFeedbackText);
      $("#feedbackNextButton").click(function(){$(this).blur(); experiment.interventionFeedbackSurprise()});
    },

    interventionFeedbackSurprise: function() {
      showSlide("feedbackSurpriseNext");
      $("#feedbackSurpriseNextButton").click(function(){$(this).blur(); experiment.validateFeedbackSurprise()});
    },

    validateFeedbackSurprise: function() {
      var fail = false,
        errorLog = "";
      var feedbackSurprise = $("#feedbackSurprise").val();
       
      if (!$.trim($("#feedbackSurprise").val())) {
        errorLog += `We noticed that you did not provide a response. Please share your thoughts.`;
        fail = true;
      } 
      if (fail) {
        if (!experiment.validateFeedbackSurpriseAlerted){
          alert(errorLog);
          // experiment.validateFeedbackSurpriseAlerted = true; // toggle to allow empty
        } else { 
          experiment.captureFeedbackSurprise(feedbackSurprise);
        }
      } else { 
        experiment.captureFeedbackSurprise(feedbackSurprise);
      }
    },

    captureFeedbackSurprise: function(feedbackSurprise) {
      experiment.interventionFeedbackSurprise = feedbackSurprise;
      updateUserFeedbackSurprise(experiment.prolificId, feedbackSurprise);
      experiment.assessmentFraming();
      return false;
    },

    assessmentFraming: function() {
      var header = "Round 2";
      var text1 = "Congrats! You have completed the first half of the activity. \
      Now, you will learn the second set of 20 Swahili-English word pairs. \
      You will go through the same 3 phases: (1) Presentation phase, \
      (2) Learning phase, and (3) Quiz phase."
      var text2 = "This time, the Learning phase is self-paced. For each Swahili word, \
      you will be able to check the English translation and move on to the next word \
      at the pace you choose.";
      showSlide("textNext");
      $("#instructionsHeader").html(header);
      $("#instructionsText1").html(text1);
      $("#instructionsText2").html(text2);
      $("#nextButton").click(function(){$(this).blur(); experiment.assessmentStudyFraming();});
      // console.log($("#instructionsText").html());
    },

    // intro to assessment study
    assessmentStudyFraming: function() {
      var header = "Round 2: Presentation phase";
      var text1 = "In a moment, you will be presented with 20 Swahili words paired with \
      their English translations. You will see each Swahili-English word pair \
      for 5 seconds, and then the screen will automatically advance to the \
      next pair. Pay attention, and study the pair so you can type \
      the English translation given the Swahili word.";
      var text2 = "Please make sure you understand these instructions before you begin."
      showSlide("textNext");
      $("#instructionsHeader").html(header);
      $("#instructionsText1").html(text1);
      $("#instructionsText2").html(text2);
      $("#nextButton").click(function(){$(this).blur(); experiment.assessmentStudy();});
      // console.log($("#instructionsText").html());
    },

    // 20 items, View each item for 5 sec
    assessmentStudy: function() {
      var trials = experiment.assessmentStudyTrials;
      if (trials.length == 0) {
        experiment.assessmentStrategyFraming();
        return;
      }

      var currItem = parseInt(trials.shift()),
        swahili = swahili_english_pairs[currItem][0],
        english = swahili_english_pairs[currItem][1];

      experiment.assessmentStudyOrderCounter += 1;
      updateItemStudyOrderData(experiment.prolificId, currItem, experiment.assessmentStudyOrderCounter, "assessment");

      wait.innerHTML = "";
      wait2.innerHTML = "";
      wait3.innerHTML = "";
      wait4.innerHTML = "";
      showSlide("study");
      $("#wordpair").html(swahili + " : " + english);
      setTimeout(function(){experiment.assessmentStudy()}, trialDuration);
    },

    assessmentStrategyFraming: function() {
      var header = "Round 2: Learning phase";
      var text1 = "Next, you will study the 20 Swahili-English word pairs. \
      For each pair, you will be shown the Swahili word. \
      <ul>\
      <li>You can click 'See Translation' to see the English Translation.\
      <li>Then, you can click 'Move On' to move on to the next word pair.</li>\
      </ul>\
      If you don't click the buttons, each screen will automatically \
      advance after 5 seconds."
      var text2 = "Please make sure you understand these instructions before you begin."
      /*var text = "Next, you will study the 20 Swahili-English word pairs. \
      For each pair, you will be shown the Swahili word. You can click 'See Translation' \
      to see the English Translation. Then, you can click 'Move On' to move on to the \
      next word pair. If you don't click the buttons, the screens will automatically \
      advance after 5 seconds. \
      <br><br> The 24 word pairs will be split into three sets of eight. You will be asked to use a \
      different study strategy for each set."*/
      showSlide("textNext");
      $("#instructionsHeader").html(header);
      $("#instructionsText1").html(text1);
      $("#instructionsText2").html(text2);
      $("#nextButton").click(function(){$(this).blur(); 
        experiment.assessmentStrategyLatencyReveal("assessmentChoice");});
    },

    /* capture latency data */
    captureTime: function(exptPhase, strategy, currItem, swahili, english, startTime, endTime){
      var latency = endTime - startTime;
      if (strategy =="assessmentChoice") {
        var strategyAbbrev = "C";
      } else if (strategy == "assessmentRestudy") {
        var strategyAbbrev = "R";   
      } else if (strategy == "assessmentGenerate") {
        var strategyAbbrev = "G";
      }

      if (exptPhase == "assessmentStrategyLatencyReveal"){
        updateItemStrategyRevealData(experiment.prolificId, currItem, strategyAbbrev, latency);
      } else if (exptPhase == "assessmentStrategyLatencyMoveOn"){
        updateItemStrategyMoveOnData(experiment.prolificId, currItem, strategyAbbrev, latency);
      }
    },

    /* For Latency pilot */
    /*Then, you will have 5 seconds to study each pair using whatever method you would like. */
    // assessmentChoiceFraming: function() {
    //   var header = "Set 1 of 3: Free Study";
    //   var text = "Please study these 8 Swahili-English word pairs <b>using whatever \
    //   study method you would like</b>.\
    //   <br><br>Please make sure you understand these instructions before you begin."
    //   showSlide("textNext");
    //   $("#instructionsHeader").html(header);
    //   $("#instructionsText").html(text);
    //   $("#nextButton").click(function(){$(this).blur(); 
    //     experiment.assessmentStrategyLatencyReveal("assessmentChoice");
    //   });
    // },

    // assessmentRestudyFraming: function() {
    //   var header = "Set 2 of 3: Study by Review";
    //   var text = "Please study these 8 Swahili-English word pairs by <b>quickly revealing the English Translation\
    //   and reviewing it</b>.\
    //   <br><br>Please make sure you understand these instructions before you begin."
    //   showSlide("textNext");
    //   $("#instructionsHeader").html(header);
    //   $("#instructionsText").html(text);
    //   $("#nextButton").click(function(){$(this).blur(); 
    //     experiment.assessmentStrategyLatencyReveal("assessmentRestudy");
    //   });
    // },

    // assessmentGenerateFraming: function() {
    //   var header = "Set 3 of 3: Study by Recall";
    //   var text = "Finally, please study these 8 Swahili-English word pairs by <b>trying to recall the \
    //   English translation from memory before revealing it</b>.\
    //   <br><br>Please make sure you understand these instructions before you begin."
    //   showSlide("textNext");
    //   $("#instructionsHeader").html(header);
    //   $("#instructionsText").html(text);
    //   $("#nextButton").click(function(){$(this).blur(); 
    //     experiment.assessmentStrategyLatencyReveal("assessmentGenerate");
    //   });
    // },

    assessmentStrategyLatencyReveal: function(stratType) {
      if (stratType == "assessmentChoice") {
        var trials = experiment.assessmentChoiceTrials;
        /* toggle for latency pilot vs. assessment */
        // if (trials.length == 0) {experiment.assessmentRestudyFraming(); return;} 
        if (trials.length == 0) {experiment.assessmentTestFraming(); return;} 
      } /* should never be triggered in intervention expt */
        else if (stratType == "assessmentRestudy") {
        var trials = experiment.assessmentRestudyTrials;
        if (trials.length == 0) {experiment.assessmentGenerateFraming(); return;} 
      } /* should never be triggered in intervention expt */
      else if (stratType == "assessmentGenerate") {
        var trials = experiment.assessmentGenerateTrials;
        if (trials.length == 0) {experiment.assessmentTestFraming(); return;} 
      }

      var currItem = parseInt(trials.shift()),
        swahili = swahili_english_pairs[currItem][0],
        english = swahili_english_pairs[currItem][1];

      experiment.assessmentStrategyOrderCounter += 1;
      //experiment.assessmentData.strategyOrder[currItem] = experiment.assessmentStrategyOrderCounter;
      updateItemStrategyOrderData(experiment.prolificId, currItem, experiment.assessmentStrategyOrderCounter, "assessment");

      if (stratType == "assessmentChoice") {
        experiment.assessmentChoiceTrialsSave.push(currItem);
      } else if (stratType == "assessmentRestudy") {
        experiment.assessmentRestudyTrialsSave.push(currItem);      
      } else if (stratType == "assessmentGenerate") {
        experiment.assessmentGenerateTrialsSave.push(currItem);
      }

      // start, and get startTime for RT
      showSlide("choiceSeeTranslation");
      $("#swahiliCue").html(swahili + " : ");
      $("#englishAnswer").css("color", bgcolor).html(Array(english.length+1).join("x"));
      var startTime = (new Date()).getTime(),
        endTime = startTime + trialDuration;

      //auto advance
      var myTimeout = setTimeout(function(){
        $("#seeTranslation").click();
      }, trialDuration); 

      //on button click, get endTime
      $("#seeTranslation").unbind();
      $("#seeTranslation").click( 
        function(){
          endTime = (new Date()).getTime();
          clearTimeout(myTimeout);
          $(this).blur();
          experiment.captureTime("assessmentStrategyLatencyReveal", stratType, currItem, swahili, english, startTime, endTime);
          experiment.assessmentStrategyLatencyMoveOn(stratType, currItem, swahili, english)});
    },

    assessmentStrategyLatencyMoveOn: function(stratType, currItem, swahili, english){

      //capture the timeout in the next slide
      showSlide("choiceNextWordPair");
      $("#swahiliCue2").html(swahili + " : ");
      $("#englishAnswer2").html(english);
      var startTime = (new Date()).getTime(),
        endTime = startTime + trialDuration;

      //auto advance
      var myTimeout = setTimeout(function(){
        $("#nextWordPair").click();
      }, trialDuration); 

      //on button click, get endTime
      $("#nextWordPair").unbind();
      $("#nextWordPair").click( 
        function(){
          endTime = (new Date()).getTime();
          clearTimeout(myTimeout);
          $(this).blur(); 
          experiment.captureTime("assessmentStrategyLatencyMoveOn", stratType, currItem, swahili, english, startTime, endTime);
          experiment.assessmentStrategyLatencyReveal(stratType)});
    },

    /*
    “Now, you will be shown each Swahili word again. You’ll have 10 seconds to type the 
    correct English translation.”
    */
    assessmentTestFraming: function() {
      var header = "Round 2: Quiz phase"
      var text1 = "Let's see what you learned! Next, you will be shown each Swahili word again.\
        You’ll have 5 seconds to type the correct English translation. After 5 seconds,\
        the screen will automatically advance and save your input."
      var text2 = "Please make sure you understand these instructions before you begin."
      showSlide("textNext");
      $("#instructionsHeader").html(header);
      $("#instructionsText1").html(text1);
      $("#instructionsText2").html(text2);
      $("#nextButton").click(function(){$(this).blur(); experiment.assessmentTest();});
    },

    assessmentTest: function(){
      var trials = experiment.assessmentTestTrials;
      if (trials.length == 0) {
        updateUserAssessmentTestScore(experiment.prolificId, experiment.assessmentTestScore);
        experiment.questionnaire(); 
        return;
      } 

      // Get the current trial - <code>shift()</code> removes the first element of the array and returns it.
      var currItem = parseInt(trials.shift()),
        swahili = swahili_english_pairs[currItem][0],
        english = swahili_english_pairs[currItem][1];

      // console.log(currItem);
      // console.log(swahili);
      // console.log(english);

      experiment.assessmentTestOrderCounter += 1;
      updateItemTestOrderData(experiment.prolificId, currItem, experiment.assessmentTestOrderCounter, "assessment");

      wait.innerHTML = "";
      wait2.innerHTML = "";
      wait3.innerHTML = "";
      wait4.innerHTML = "";
      showSlide("test");
      $("#swahiliTest").html(swahili + " : ");
      $("#testedWord").val('');
      $("#testedWord").focus();

      // Wait 5 seconds before starting the next trial.
      setTimeout(function(){$("#testedForm").submit(
        experiment.captureAssessmentTestWord(currItem, swahili, english));
      }, trialDuration); 
    },

    captureAssessmentTestWord: function(currItem, swahili, english){
      var userInput = processUserInput($("#testedWord").val()),
        accuracy = english == userInput ? 1 : 0;

      // console.log(userInput)

      experiment.assessmentTestScore += accuracy;
      experiment.assessmentTest();
      updateItemTestAccuracyData(experiment.prolificId, currItem, accuracy, userInput, "assessment");
      // experiment.assessmentTestData.push(data);
    },

    questionnaire: function() {
      var restudyReminderText = `In the first round of learning Swahili-English word pairs, you studied half of the word pairs using  
        the <b>review</b> strategy--you reviewed the English translation by copying it into the textbox.`;
      var generateReminderText = `In the first round of learning Swahili-English word pairs, you studied half of the word pairs using  
        the <b>recall</b> strategy--you tried to recall the English translation from memory.`;

      var restudyEffectiveText = `In general, how effective is the <b>review</b> strategy?`;
      var generateEffectiveText = `In general, how effective is the <b>recall</b> strategy?`;

      var restudyEffortText = `In general, how much effort does the <b>review</b> strategy require?`;
      var generateEffortText = `In general, how much effort does the <b>recall</b> strategy require?`;

        //TODO DECIDE: `You could study using whatever strategy you chose`
      var howManyText = `In the second round of learning, you could study the ${experiment.numTrials/2} Swahili-English 
      word pairs using any strategy you chose.`
      var restudyHowManyText = `For these ${experiment.numTrials/2} Swahili-English word pairs, how many times was <b>review</b> 
      (i.e. attempting to review the English translation) part of your chosen study strategy?`;
      var generateHowManyText = `For these ${experiment.numTrials/2} Swahili-English word pairs, how many times was <b>recall</b> 
      (i.e. attempting to recall the English translation) part of your chosen study strategy?`;


      if (experiment.predictRestudyFirst){
        // predict restudy first, then predict generate
        // var firstQuestionText = restudyQuestionText;
        // var secondQuestionText = generateQuestionText;
        var firstReminderText = restudyReminderText;
        var firstEffectiveText = restudyEffectiveText;
        var firstEffortText = restudyEffortText;
        var firstHowManyText = restudyHowManyText;
        var secondReminderText = generateReminderText;
        var secondEffectiveText = generateEffectiveText;
        var secondEffortText = generateEffortText;
        var secondHowManyText = generateHowManyText;
      } else {
        // predict generate first, then predict restudy
        // var firstQuestionText = generateQuestionText;
        // var secondQuestionText = restudyQuestionText;
        var firstReminderText = generateReminderText;
        var firstEffectiveText = generateEffectiveText;
        var firstEffortText = generateEffortText;
        var firstHowManyText = generateHowManyText;
        var secondReminderText = restudyReminderText;
        var secondEffectiveText = restudyEffectiveText;
        var secondEffortText = restudyEffortText;
        var secondHowManyText = restudyHowManyText;
      }

      showSlide("questionnaire");
      $("#firstReminderText").html(firstReminderText);
      $("#firstEffectiveText").html(firstEffectiveText);
      $("#firstEffortText").html(firstEffortText);
      $("#firstHowManyText").html(firstHowManyText);
      $("#secondReminderText").html(secondReminderText);
      $("#secondEffectiveText").html(secondEffectiveText);
      $("#secondEffortText").html(secondEffortText);
      $("#secondHowManyText").html(secondHowManyText);
      $("#howManyText").html(howManyText);
      $(".howManyDenominator").html(`/${experiment.numTrials/2}`);
      $("#questionnaireNextButton").click(function(){$(this).blur(); 
        $("#questionnaireForm").submit(experiment.validateQuestionnaire());
      })
    },

    validateQuestionnaire: function(){
      var fail = false,
        errorLog = "We noticed that you did not provide a valid response to some of our questions. Please check your response to the following questions:\n",
        names = ['Q1a', 'Q1b', 'Q2a', 'Q2b', 'Q3a', 'Q3b', 'Q3c', 'Q4a', 'Q4b', 'Q5']
      for (name of names){
        if (name == 'Q3a'){ 
          // strategy textarea, trim whitespace
          if (!$.trim($("#Q3a").val())){
            fail = true;
            errorLog += name + " ";
          }
        } else if (name == 'Q4a') {
          var Q4a = parseInt($("#Q4a").val())
          if (!(Q4a >= 0 & Q4a <= experiment.numTrials/2)){
            errorLog += name + " ";
            fail = true;
          }
        } else if (name == 'Q4b') {
          var Q4b = parseInt($("#Q4b").val())
          if (!(Q4b >= 0 & Q4b <= experiment.numTrials/2)){
            errorLog += name + " ";
            fail = true;
          }
        } else if (! $("input:radio[name=inputName]".replace("inputName", name)).is(":checked")) {
          // radio buttons
          fail = true;
          errorLog += name + " ";
        } 
      }        
      if (fail) {
        if (!experiment.validateQuestionnaireAlerted){
          // errorLog += `But if you'd prefer not to, you can click the "Next" button below.\n`;
          alert(errorLog);
          // experiment.validateQuestionnaireAlerted = true; // toggle to allow empty
        } else {
        experiment.captureQuestionnaire();
        }
      } else {
        experiment.captureQuestionnaire();
      }
    },

    captureQuestionnaire: function(){
      if (experiment.predictRestudyFirst){
        var effectivenessRestudy = $("input:radio[name=Q1a]:checked").val(),
          effortRestudy = $("input:radio[name=Q1b]:checked").val(),
          howManyRestudy = parseInt($("#Q4a").val()),
          effectivenessGenerate = $("input:radio[name=Q2a]:checked").val(),
          effortGenerate = $("input:radio[name=Q2b]:checked").val(),
          howManyGenerate = parseInt($("#Q4b").val());
      } else {
        var effectivenessRestudy = $("input:radio[name=Q2a]:checked").val(),
          effortRestudy = $("input:radio[name=Q2b]:checked").val(),
          howManyRestudy = parseInt($("#Q4b").val()),
          effectivenessGenerate = $("input:radio[name=Q1a]:checked").val(),
          effortGenerate = $("input:radio[name=Q1b]:checked").val(),
          howManyGenerate = parseInt($("#Q4a").val());
      }
      var chosenStrategy = $("#Q3a").val(),
        effectivenessChosenStrategy = $("input:radio[name=Q3b]:checked").val(),
        effortChosenStrategy = $("input:radio[name=Q3c]:checked").val(),
        effort = $("input:radio[name=Q5]:checked").val();
      updateUserQuestionnaire(experiment.prolificId, effectivenessRestudy, effortRestudy, howManyRestudy, 
        effectivenessGenerate, effortGenerate, howManyGenerate,
        chosenStrategy, effectivenessChosenStrategy, effortChosenStrategy, effort);
      experiment.end()
    },

    // The function that gets called when the sequence is finished.
    end: function() {
      var endDateTime = new Date();
      updateUserEndDateTime(experiment.prolificId, endDateTime);
      /*
      experiment.totalScore = interventionTestRestudyScore + interventionTestGenerateScore + assessmentTestScore;
      experiment.bonusPayment = totalScore * .05;
      var bonusPaymentText = `Across the two quizzes, you typed ${experiment.totalScore} correct English
        translations, which means you earned $ ${experiment.bonusPayment} in bonus payments.`
      */
      showSlide("end");
      // $("#bonusPaymentText").html( );
      $("#redirectButton").click(function(){$(this).blur(); experiment.redirect();});
    },

    redirect: function() {
      var comments = $("#comments").val();
      updateUserComments(experiment.prolificId, comments);
      window.location.replace("https://app.prolific.co/submissions/complete?cc=NT1G43OG");
    },

    // Called if the user does not consent at the beginning
    doesNotConsent: function() {
      showSlide("doesNotConsent");
      $("#noConsentCommentsButton").click(function(){$(this).blur(); experiment.endNoConsent();});
    },

    endNoConsent: function() {
      var comments = $("#noConsentComments").val();
      updateUserComments(experiment.prolificId, comments);
      showSlide("thankyou");
    }
  }
}

/*
Query database to find condition
when promise returns, run expt and show first slide
*/
getCondition();

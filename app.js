var fs = require('fs');
//var colors = require('colors');
var readline = require('readline');

var wordList = {};
var nextWordList = [];
var todaysWordList = [];

var today = new Date();
today.setHours(0,0,0,0); //Removes all times from new date

fs.readFile('baseWords.json', function(err, data) {
  if (err) throw err;
  wordList = JSON.parse(data);
  todaysQuizWords(wordList);
});

function quizWord(number, word) {
  if (!word[number]) {
    console.log("All done for today.");
  } else {
    var currentWord = word[number];
    console.log("Spanish: " + currentWord.spanish);
    setTimeout(function() {
      console.log("Correct Answer: " + currentWord.english);
      getTestResult(number, "Enter 1, 2 or 3: ", recordAnswer);
    }, 2000); 
  }
}

function recordAnswer(number, answer) {
  console.log(answer);
}

function getTestResult(number, question, callback) {
  var rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  rl.question(question, function(answer) {
        if (answer >= 1 && answer <= 3) {
            callback(number, answer);
            rl.close();
            //nextTest(number);
        } else {
            rl.close();
            getTestResult(number, question, recordAnswer);
        }

    //kick off the next question
    var nextWord = number + 1;
    quizWord(nextWord, todaysWordList);
  });
}

function todaysQuizWords(wordList) {
  for (i=0; i<wordList.length; i++) {
    var word = wordList[i];
    if (!word.nextTestDate) { word.nextTestDate = today; } // first time through might not have a next test date, so do it today
    if (!word.prevTestDate) { word.prevTestDate = today; }
    if (!word.testHistory) { testHistory = []; } else { testHistory = word.testHistory; }

    var nextTestDate = new Date(word.nextTestDate); //convert to js date type

    if (nextTestDate <= today) {

      // add it to the list of todays test list
      todaysWordList.push({ "english" : word.english, "spanish" : word.spanish, "nextTestDate" : nextTestDate, "prevTestDate" : today, "testHistory" : testHistory });

      // var testScore = {};
      // testScore.date = today;
      // testScore.score = 4;
      // testHistory.push(testScore);

    } else { // just push it along if not due for test yet
      nextWordList.push({ "english" : word.english, "spanish" : word.spanish, "nextTestDate" : word.nextTestDate, "prevTestDate" : word.prevTestDate, "testHistory" : testHistory});
    }
  }
 quizWord(0, todaysWordList); //start the first quiz
};



// var writeFile = function() {
//   fs.writeFile('nextTestWords.json', JSON.stringify(nextWordList, null, 2), function(err) {
//     if (err) throw err;
//     console.log("Saved next test file");
//   });
// };
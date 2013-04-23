var fs = require('fs');
//var colors = require('colors');

var wordList = {};
var nextWordList = [];
var today = new Date();
today.setHours(0,0,0,0); //Remove all time from new date

fs.readFile('baseWords.json', function(err, data) {
  if (err) throw err;
  wordList = JSON.parse(data);
  loopWords(wordList);
});

var loopWords = function(json) {
  for (i=0; i<json.length; i++) {
    var word = json[i];
    if (!word.nextTestDate) { word.nextTestDate = today; } // if its a new word do a test today
    if (!word.prevTestDate) { word.prevTestDate = today; }
    if (!word.testHistory) { testHistory = []; } else { testHistory = word.testHistory; }

    var nextTestDate = new Date(word.nextTestDate); //convert to js date type

    if (nextTestDate <= today) {
      //lets pretend they test and we calculate 4 days for next test date
      nextTestDate.setDate(today.getDate() + 4);
      console.log("You tested: 4 for the word " + word.english);
      var testScore = {};
      testScore.date = today;
      testScore.score = 4;
      testHistory.push(testScore);
      nextWordList.push({ "english" : word.english, "spanish" : word.spanish, "nextTestDate" : nextTestDate, "prevTestDate" : today, "testHistory" : testHistory });

    } else { // just push it along if not due for test yet
      nextWordList.push({ "english" : word.english, "spanish" : word.spanish, "nextTestDate" : word.nextTestDate, "prevTestDate" : word.prevTestDate, "testHistory" : testHistory});
    }
  }
  writeFile();
};

var writeFile = function() {
  fs.writeFile('nextTestWords.json', JSON.stringify(nextWordList, null, 2), function(err) {
    if (err) throw err;
    console.log("Saved next test file");
  });
};
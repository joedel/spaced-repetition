var fs = require('fs');
var colors = require('colors');

// process.stdin.resume();
// process.stdin.pause();

var wordList = {};
var nextWordList = [];
var today = new Date();
today.setHours(0,0,0,0); //Removes all times from new date
console.log(today);

fs.readFile('baseWords.json', function(err, data) {
  if (err) throw err;
  wordList = JSON.parse(data);
  loopWords(wordList);
});

var loopWords = function(json) {
  for (i=0; i<json.wordList.length; i++) {
    var word = json.wordList[i];
    if (!word.nextTestDate) { word.nextTestDate = today; } // first time through might not have a next test date

    var nextTestDate = new Date(word.nextTestDate); //convert to js date type

    if (nextTestDate <= today) {
      //lets pretend they test and put 4 days for next test date
      nextTestDate.setDate(today.getDate() + 4);
      nextWordList.push({ "english" : word.english, "spanish" : word.spanish, "nextTestDate" : nextTestDate});

    } else { // just push it along if not due for test yet
      nextWordList.push({ "english" : word.english, "spanish" : word.spanish, "nextTestDate" : word.nextTestDate});
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
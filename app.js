var fs = require('fs');
var readline = require('readline');

var wordList = {};
var futureQuizList = [];
var todaysQuizList = [];

var today = new Date();
today.setHours(0,0,0,0);

console.log("Welcome to Spaced Repetition in Node!");
console.log("After each word please record your result as follows:");
console.log("1. If you had no trouble and recognized the word instantly");
console.log("2. If you correctly knew the word by the time the answer was shown");
console.log("3. If you had trouble or did not know the word at all");
console.log("Get ready...");

//You can change the input file here
fs.readFile('baseWords.json', function(err, data) {
  if (err) throw err;
  wordList = JSON.parse(data);
  buildQuizList(wordList);
});

function buildQuizList(wordList) {
  for (i=0; i<wordList.length; i++) {
    var word = wordList[i];
    if (!word.nextTestDate) { word.nextTestDate = today; } // first time through might not have a next test date, so do it today
    if (!word.prevTestDate) { word.prevTestDate = today; }
    if (!word.testHistory) { testHistory = []; } else { testHistory = word.testHistory; }
    var nextTestDate = new Date(word.nextTestDate); //convert to js date type

    if (nextTestDate <= today) {
      todaysQuizList.push({ "word1" : word.word1, "word2" : word.word2, "nextTestDate" : nextTestDate, "prevTestDate" : word.prevTestDate, "testHistory" : testHistory });
    } else { // just push it to the list to be saved if not due yet
      futureQuizList.push({ "word1" : word.word1, "word2" : word.word2, "nextTestDate" : word.nextTestDate, "prevTestDate" : word.prevTestDate, "testHistory" : testHistory});
    }
  }
}

//Start quiz
setTimeout(function() {
   showQuizItem(0, todaysQuizList);
 }, 3000);

function showQuizItem(number, wordList) {
  if (!wordList[number]) {
    console.log("No more words available today.");
    writeFile();
  } else {
    var currentWord = wordList[number];
    console.log("Spanish: " + currentWord.word2);
    setTimeout(function() {
      console.log("Correct Answer: " + currentWord.word1);
      askQuizResult(number, "Enter 1, 2 or 3: ");
    }, 4000);
  }
}

function askQuizResult(number, question) {
  var rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  rl.question(question, function(result) {
        result = parseInt(result, 10);
        if (result >= 1 && result <= 3) {
            recordResults(number, result);
            rl.close();
        } else {
            rl.close();
            askQuizResult(number, question);
        }
  });
}

function recordResults(number, result) {
  var wordToPush = todaysQuizList[number];
  var prevTestDate = new Date(wordToPush.prevTestDate); //convert to js date
  var lastQuizInterval = 1;
  var nextQuizDate = new Date();
  nextQuizDate.setHours(0,0,0,0);

  if (prevTestDate.getTime() === today.getTime()) { //need to use getTime since comparison doesn't work otherwise
    lastQuizInterval = 1;
  } else {
    lastQuizInterval = new Date(today - prevTestDate).getDate(); //Issue: Limited to amount of days in current month
  }

  if (result === 1) {
    //They instantly knew the word, so increase the time before it is shown again (minimum 5).
    if (lastQuizInterval < 5) {
      nextQuizDate.setDate(nextQuizDate.getDate() + 5);
    } else {
      nextQuizDate.setDate(nextQuizDate.getDate() + (lastQuizInterval * 2));
    }
  } else if (result === 2) {
    //They kind of knew the word, keep the interval the same (minimum 2)
    if (lastQuizInterval < 2 ) {
      nextQuizDate.setDate(nextQuizDate.getDate() + 2);
    } else {
      nextQuizDate.setDate(nextQuizDate.getDate() + (lastQuizInterval));
    }
  } else if (result === 3) {
    //They did not know the word at all, show the word again tomorrow, or today if they run the program again.
    // nextQuizDate.setDate(nextQuizDate.getDate()); // default is today
  } else {
    console.log("Something went wrong while recording the result.");
  }
  //Push to next quiz word list
  wordToPush.nextTestDate = nextQuizDate;
  wordToPush.prevTestDate = today;
  wordToPush.testHistory.push({"date" : today, "score" : result});
  futureQuizList.push({ "word1" : wordToPush.word1, "word2" : wordToPush.word2, "nextTestDate" : wordToPush.nextTestDate, "prevTestDate" : wordToPush.prevTestDate, "testHistory" : wordToPush.testHistory});

  //kick off the next question
  var nextWord = number + 1;
  showQuizItem(nextWord, todaysQuizList);
}

var writeFile = function() {
  fs.writeFile('baseWords.json', JSON.stringify(futureQuizList, null, 2), function(err) {
    if (err) throw err;
    console.log("Results saved to file.");
  });
};
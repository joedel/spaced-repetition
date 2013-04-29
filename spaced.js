var fs = require('fs');
var readline = require('readline');

var quizList = [];
var futureQuizList = [];
var quizTimer = 3000;
var today = new Date();
today.setHours(0,0,0,0);


console.log("Welcome to Spaced Repetition in Node!\n" +
  "After each word please grade yourself as follows:\n" +
  "(0) What the heck was that? (No recognition)\n" +
  "(1) Wrong answer, but recognized the word.\n" +
  "(2) Wrong answer, but it was on the tip of my tongue!\n" +
  "(3) Got it right, but just barely.\n" +
  "(4) Got it right, had to think about it.\n" +
  "(5) Knew the answer immediately.");

function getUserInput(prompt, printResult) {
  var rl = readline.createInterface(process.stdin, process.stdout);
  if (prompt) {rl.setPrompt(prompt); }
  rl.prompt();
  rl.on('line', function(line) {
    rl.close();
    printResult(line);
  });
}

function printResult(line) {
  console.log(line);
}

//You can change the input file here
fs.readFile('baseCards.json', function(err, data) {
  if (err) throw err;
  cards = JSON.parse(data);
  buildQuizList(cards);
});

function buildQuizList(cards) {
  for (i=0; i<cards.length; i++) {
    var card = cards[i];
    //Set Defaults if first time card
    if (!card.nextDate) { card.nextDate = today; }
    if (!card.prevDate) { card.prevDate = today; }
    if (!card.interval) { card.interval = 0; }
    if (!card.rep) {  card.reps = 0; }
    if (!card.EF) { card.EF = 2.5; }

    //var nextDate = new Date(card.nextDate); //convert to js date type

    if (card.nextDate <= today) {
      quizList.push(card);
      //quizList.push({ "side1" : card.side1, "side2" : card.side2, "nextDate" : nextDate, "prevDate" : card.prevDate, "EF" : card.EF });
    } else { // just push it to the list to be saved if not due yet
      futureQuizList.push(card);
      //futureQuizList.push({ "side1" : card.side1, "side2" : card.side2, "nextDate" : card.nextDate, "prevDate" : word.prevDate});
    }

  }
    console.log("Cards At The Ready: " + quizList.length);
    tryQuiz(quizList);
}

function tryQuiz(quizList) {
  var card = quizList[0];
    console.log("Side 1: " + card.side1);
    setTimeout(function() {
      console.log("Side 2: " + card.side2);
      getUserInput("Grade> ", printResult);
    }, quizTimer);
}
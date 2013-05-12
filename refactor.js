// Spaced Repetition is an efficient learning system that attempts to quiz the 
// user with flash cards at specific intervals for maximum memory retention. 
// The quiz interval is determined by the (0-5) rating the user gives after seeing
// each card, and increases or decreases depending on difficulty.

// The algorithm implemented here is the SM-2 algorithm used in the SuperMemo-2
// software as well as the popular open source Anki software.
// The algorithm is described here: http://www.supermemo.com/english/ol/sm2.htm

// Open Source MIT LICENSE
// This code lives here: https://github.com/joedel/spaced-repetition/
// Any feedback or tips to improve greatly appreciated.

var fs = require('fs');
var readline = require('readline');

var cardFile = 'baseCards.json',
    quizList = [],
    quizTimer = 4000,
    today = new Date(),
    cards = [],
    cardCounter = 0,
    count = 0;

today.setHours(0,0,0,0);

console.log("Welcome to Command Line Spaced Repetition!\n" +
  "After each word please grade yourself as follows:\n" +
  "(0) What the heck was that? (No recognition)\n" +
  "(1) Wrong answer, but recognized the word.\n" +
  "(2) Wrong answer, but it was on the tip of my tongue!\n" +
  "(3) Got it right, but just barely.\n" +
  "(4) Got it right, had to think about it.\n" +
  "(5) Knew the answer immediately.");

function readCardFile(file) {
  var data = fs.readFileSync(file);
  return JSON.parse(data);
}

function cardQuizCount() {
  var count = 0;
  for (var i=0; i<cards.length; i++) {
    var card = cards[i];
    var date = new Date(card.nextDate);
    if (card.interval === 0 || !card.interval || date.getTime() <= today.getTime()) {
      count++;
    }
  }
  return count;
}

function preQuiz(count) {
  if (count > 0) {
    console.log("You have " + count + " cards to go through.");
    getUserInput("Press enter to begin or 'exit' to quit: ", startStopQuiz);
  } else {
    console.log("No cards due. Come back tomorrow :)");
  }
}

function getUserInput(question, processInput, card) {
  var rl = readline.createInterface(process.stdin, process.stdout);
  rl.setPrompt(question);
  rl.prompt();
  rl.on('line', function(line) {
    rl.close();
    processInput(line, card);
  });
}

function startStopQuiz(line) {
  if (line.trim() === "exit") {
    return;
  } else {
    cardCounter = 0;
    getNextCard(cards[0]);
  }
}

function endOfCardList() {
  writeCardFile(cardFile); //Save progress to file
  var count = cardQuizCount();
  preQuiz(count); //restart quiz with any low grade cards
}

function getNextCard(card) {
  if (!card) {
    endOfCardList();
    return;
  }
  //defaults if new card
  if (!card.nextDate) { card.nextDate = today; }
  if (!card.prevDate) { card.prevDate = today; }
  if (!card.interval) { card.interval = 0; }
  if (!card.reps) {  card.reps = 0; }
  if (!card.EF) { card.EF = 2.5; }

  var nextDate = new Date(card.nextDate); //convert to comparable date type
  if (nextDate <= today) {
    quizCard(card);
  } else {
    cardCounter++;
    getNextCard(cards[cardCounter]);
  }
}

function quizCard(card) {
  console.log("Side 1: " + card.side1);
  setTimeout(function() {
    console.log("Side 2: " + card.side2);
    getUserInput("Grade> ", parseCardGrade, card);
  }, quizTimer);
}

function parseCardGrade(line, card) {
  var grade = parseInt(line, 10);
  if (grade >= 0 && grade <= 5) {
    calcIntervalEF(card, grade);
    cardCounter++;
    getNextCard(cards[cardCounter]);

  } else { //Bad input
    getUserInput("Please enter 0-5 for... " + card.side2 + ": ", parseCardGrade, card);
  }
}

// SM-2:
// EF (easiness factor) is a rating for how difficult the card is.
// Grade: (0-2) Set reps and interval to 0, keep current EF (repeat card today)
//        (3)   Set interval to 0, lower the EF, reps + 1 (repeat card today)
//        (4-5) Reps + 1, interval is calculated using EF, increasing in time.
function calcIntervalEF(card, grade) {
  var oldEF = card.EF,
      newEF = 0,
      nextDate = new Date(today);

  if (grade < 3) {
    card.reps = 0;
    card.interval = 0;
  } else {

    newEF = oldEF + (0.1 - (5-grade)*(0.08+(5-grade)*0.02));
    if (newEF < 1.3) { // 1.3 is the minimum EF
      card.EF = 1.3;
    } else {
      card.EF = newEF;
    }

    card.reps = card.reps + 1;

    switch (card.reps) {
      case 1:
        card.interval = 1;
        break;
      case 2:
        card.interval = 6;
        break;
      default:
        card.interval = Math.round((card.reps - 1) * card.EF);
        break;
    }
  }

  if (grade === 3) {
    card.interval = 0;
  }

  nextDate.setDate(today.getDate() + card.interval);
  card.nextDate = nextDate;
}

function writeCardFile(cardFile) {
  fs.writeFileSync(cardFile, JSON.stringify(cards, null, 2));
  console.log("\nProgress saved back to file.");
}

cards = readCardFile(cardFile);
count = cardQuizCount();
preQuiz(count);
var fs = require('fs');
var readline = require('readline');

var quizList = [],
    quizTimer = 1000,
    today = new Date(),
    cards = [],
    cardCounter = 0,
    dayMS = 1000 * 60 * 60 * 24;

today.setHours(0,0,0,0);

console.log("Welcome to Spaced Repetition in Node!\n" +
  "After each word please grade yourself as follows:\n" +
  "(0) What the heck was that? (No recognition)\n" +
  "(1) Wrong answer, but recognized the word.\n" +
  "(2) Wrong answer, but it was on the tip of my tongue!\n" +
  "(3) Got it right, but just barely.\n" +
  "(4) Got it right, had to think about it.\n" +
  "(5) Knew the answer immediately.");

function readCardFile(file) {
  fs.readFile(file, function(err, data) {
    if (err) throw err;
    cards = JSON.parse(data);
    var count = cardQuizCount();
    if (count) {
      console.log("You have " + count + " cards to go through today");
      getUserInput("Press Enter to Begin...", startStopQuiz);
    } else {
      console.log("There are no cards to quiz for today");
    }
  });
}

readCardFile('baseCards.json');

function getUserInput(question, next, card) {
  var rl = readline.createInterface(process.stdin, process.stdout);
  rl.setPrompt(question);
  rl.prompt();
  rl.on('line', function(line) {
    rl.close();
    if (!card) {
      next(line);
    } else {
      next(line, card);
    }
  });
}

function startStopQuiz(line) {
  if (line.trim() === "exit") {
    return;
  } else {
    var count = cardQuizCount();
    if (count) {
      cardCounter = 0;
      getNextCard(cards[0]);
    }
  }
}

function cardQuizCount() {
  var count = 0;
  for (var i=0; i<cards.length; i++) {
      if (cards[i].interval === 0 || !cards[i].interval) {
        count++;
      }
  }
  //console.log(count);
  return count;
}

cardQuizCount();

function getNextCard(card) {
    if (!card) {
      var count = cardQuizCount();
      if (count) {
        getUserInput("Done. Hit enter to repeat " + count + " cards graded 3 or lower, or type exit to finish: ", startStopQuiz);
      } else {
        getUserInput("Done for today. Type 'exit' or hit Ctrl-C to quit", startStopQuiz);
      }
      return;
    }
    //Set Defaults if first time card
    if (!card.nextDate) { card.nextDate = today; }
    if (!card.prevDate) { card.prevDate = today; }
    if (!card.interval) { card.interval = 0; }
    if (!card.rep) {  card.reps = 0; }
    if (!card.EF) { card.EF = 2.5; }

    if (card.nextDate <= today) {
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
      getUserInput("Grade> ", processGrade, card);
    }, quizTimer);
}

function processGrade(line, card) {
  var grade = parseInt(line, 10);
  if (grade <= 5 && grade >= 0) {
    updateCard(card, grade);
    cardCounter++;
    getNextCard(cards[cardCounter]);

  } else { //Bad input
    getUserInput("Please enter 0-5 for... " + card.side2 + ": ", processGrade, card);
  }
}

function updateCard(card, grade) {
  var oldEF = card.EF,
      newEF = 0,
      nextDate = new Date(today);

  if (grade < 3) {

    card.reps = 0; //Reset the reps as if it was a new card
    card.interval = 0; //Repeat today

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
        card.interval = Math.ceil((card.reps - 1) * card.EF);
        break;
    }
  }

  if (grade === 3) {
    card.interval = 0; //anything 3 and below should be repeated today if possible
  }

  nextDate.setDate(today.getDate() + card.interval);
  card.nextDate = nextDate;

  //console.log(card);
  //console.log(cards[cardCounter]);
}
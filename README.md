Spaced Repetition
=================
This is a simple command line Node.js program that helps you learn words in a foreign language.

It uses a (very) simple spaced repetition calculation to determine when you should be tested on the same word again, and then prints the results to the orignal file.

To run
------
- Clone the repo and create your word list (see baseWords.json)
- On the command line run: node app.js
- Repeat as necessary to learn your word list :)

TODO: 
- let user add words through the cli
- improve the spaced repetition algorithm
- refactor
- do something interesting with the history, like a graph of progress
- let user choose when to start or skip to answer without waiting 4 seconds
- let user choose input file from command line instead of hard coded

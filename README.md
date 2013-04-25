Spaced Repetition
=================
This is a simple command line Node.js program that helps you learn words in a foreign language.

It uses a (very) simple spaced repetition calculation to determine when you should be tested on the same word again, and then prints the results to the orignal file.

Just set up your initial json file with your native language/foreign language pairs and run the program once a day. See baseWords.json for an example with english/spanish words.


TODO: 
- let user add words through the cli
- improve the spaced repetition algorithm
- refactor
- do something interesting with the history, like a graph of progress
- let user choose when to start or skip to answer without waiting 4 seconds
- let user choose input file from command line instead of hard coded

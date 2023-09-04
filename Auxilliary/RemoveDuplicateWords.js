const fs = require('fs');

function removeDuplicateWords(jsonFile) {
  // Parse the JSON file to extract the list of words
  let words = JSON.parse(jsonFile).words;

  // Use a Set to automatically remove duplicate words
  let uniqueWords = new Set(words);
  let arr = Array.from(uniqueWords);
  console.log(arr.length);

  // Convert the Set back to a list and return it as a JSON string
  return JSON.stringify(Array.from(uniqueWords));
}




// read the JSON file containing the list of words
const jsonFile = fs.readFileSync('./unique-words.json');

// remove duplicate words from the list
const uniqueWordsJson = removeDuplicateWords(jsonFile);

// write the JSON string to a file
fs.writeFileSync('wordlistv2.json', uniqueWordsJson);

  
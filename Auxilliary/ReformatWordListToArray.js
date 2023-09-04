const fs = require('fs');
const axios = require('axios').default;
let responseData = [];


function convertToArray(obj) {
    const result = [];
    let test = JSON.parse(obj);
    for (const word in test.words) {
      const wordObj = test.words[word];
      const definitions = [];
      for (const key in wordObj) {
        if (key.startsWith('definition_')) {
          definitions.push(wordObj[key]);
        }
      }
      result.push({
        word: word,
        phonetic: wordObj.phonetic,
        definition: definitions,
      });
    }
    // console.log(result)
    return result;
}
  

const jsonFile = fs.readFileSync('./wordlistOfficial.json');
const output = convertToArray(jsonFile);
console.log(output)
// console.log(unique)
fs.writeFileSync('output.json', JSON.stringify(output));
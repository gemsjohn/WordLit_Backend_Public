const fs = require('fs');
const axios = require('axios').default;
let responseData = [];


  async function reformatJSON(json) {
    let words = JSON.parse(json);
    const reformattedJSON = { words: {} };
    // console.log(words.length)

    // for (let i = 0; i < words.length; i++) { 
        // words.forEach(word => {
        //     setTimeout(() => {
        //         const API_ENDPOINT = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;
            
        //         axios.get(API_ENDPOINT)
        //         .then(response => {
        //             if (response.data[0].word) {
        //                 if (response && response.data && response.data[0]) {
        //                     if (response.data[0].phonetic) {
        //                         reformattedJSON.words[word] = { phonetic: `${response.data[0].phonetic}` };
        //                         console.log("#1")
        //                     } else {
        //                         reformattedJSON.words[word] = { phonetic: '' };
        //                         console.log("#2")
        //                     }

        //                     if (response.data[0].meanings && response.data[0].meanings[0] && response.data[0].meanings[0].definitions) {

        //                         for (let x = 0; x < response.data[0].meanings[0].definitions.length; x++) {
        //                             if (x < 3) {
        //                                 if (response.data[0].meanings[0].definitions[x].definition) {
        //                                     reformattedJSON.words[word][`definition_${x}`] = `${response.data[0].meanings[0].definitions[x].definition}`;
        //                                 }
        //                             }
        //                         }
        //                 }
        //                 }
        //             }
        //             handleStore(reformattedJSON)
        //         })
        //         .catch(error => {
        //             // Handle any errors
        //             console.error(error);
        //         });
        // }, 2000)
    // });
    
}

function handleStore(arr) {
    // console.log(arr)
    responseData.splice[0]
    responseData.push(arr)
    // console.log(responseData);
    fs.writeFileSync('output.json', JSON.stringify(responseData[0]));
}
  

const jsonFile = fs.readFileSync('./output.json');
const unique = reformatJSON(jsonFile);
console.log(unique)
// fs.writeFileSync('output.json', unique);
// app.js
const http = require('http');
const jsonData = require('./incoming.json');

//let jenkinsFormat = jsonData.choices[0].message.content;
//console.log(jenkinsFormat);

const args = process.argv.slice(2); // Ignore first two default arguments (node and script name)
//let jenkinsFormat = args.choices[0].message.content;

//var t = JSON.stringify(args);
//console.log(t);

console.log("args " +  args);


// const jsonObject = {
//   "messages": [{
//     "content": jenkinsFormat,
//     "role": "user"
//   }]
// };
//console.log(JSON.stringify(jsonObject));
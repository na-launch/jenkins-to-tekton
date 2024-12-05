// app.js
const http = require('http');
const jsonData = require('./incoming.json');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2); // Ignore first two default arguments (node and script name)
//let jenkinsFile = args.choices[0].message.content;

console.log(args);

// Path to the Jenkinsfile
const jenkinsfilePath = path.join(__dirname, args[0]);           //todo change this

const urlJnk2eng = 'https://jenkins-to-english-test-model-serving.apps.demo.sandbox1298.opentlc.com/v1/chat/completions';
const urleng2tkn = 'https://english-to-tekton-serving-odyssey-2.apps.demo.sandbox1298.opentlc.com/v1/chat/completions';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';


// Read the Jenkinsfile
fs.readFile(jenkinsfilePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading Jenkinsfile:', err);
        return;
    }
    // console.log('Jenkinsfile content:\n', data);     // JENKINS FILE LOADED    
    sendJsonRequestToJnk2EngServer(data);
});

async function sendJsonRequestToJnk2EngServer(bodyData) {
    console.log("Sending Jenkins file to JEK2ENG Server");
    try {
        const response = await axios.post(
            urlJnk2eng,
            {
                "messages": [
                    {
                        "content": "describe the stages in the following Jenkinsfile: " + bodyData,
                        "role": "user"
                    }
                ]
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );                            
        
        let jsonResult = response.data;
        let scrub1 = JSON.stringify(jsonResult.choices[0].message.content).replace(/\\n/g, '');
        let final = scrub1.replace(/`/g, "\'");
        console.log(final);
        sendJsonRequestToEng2TektonServer(final);
    } catch (error) {
        console.error('Error:', error);
    }
}
   
async function sendJsonRequestToEng2TektonServer(bodyData) {
    console.log("Sending Jenkins file to ENG2TEK Server");
    try {
        const response = await axios.post(
            urleng2tkn,
            {
                "messages": [
                  {
                    "content": "Create a Tekton pipeline using the following description: ",
                    "role": "user"
                  }
                ]
              },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
        let jsonResult = response.data;
        console.log(jsonResult);

    } catch (error) {
        console.error('Error:', error);
    }
}



//let jenkinsFormat = jsonData.choices[0].message.content;
//console.log(jenkinsFormat);


//var t = JSON.stringify(args);
//console.log(t);

//console.log("args " +  args);


// const jsonObject = {
//   "messages": [{
//     "content": jenkinsFormat,
//     "role": "user"
//   }]
// };
//console.log(JSON.stringify(jsonObject));
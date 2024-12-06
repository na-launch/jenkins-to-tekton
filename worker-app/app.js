// app.js
const http = require('http');
const jsonData = require('./incoming.json');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2); // Ignore first two default arguments (node and script name)

// Path to the Jenkinsfile
const jenkinsfilePath = path.join(__dirname, args[0]);           //todo change this
const dummyTektonFilePath = path.join(__dirname, "/tekton/pipeline/p2.yaml");           //todo change this
//const jenkinsfilePath = args[0];

const urlJnk2eng = 'https://jenkins-to-english-test-model-serving.apps.demo.sandbox1298.opentlc.com/v1/chat/completions';
const urleng2tkn = 'https://eng-tekton-model-serving.apps.demo.sandbox1298.opentlc.com/v1/chat/completions';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Read the Jenkinsfile
fs.readFile(jenkinsfilePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading Jenkinsfile:', err);
        return;
    }
    // console.log('Jenkinsfile content:\n', data);     // JENKINS FILE LOADED    
    sendJsonRequestToJnk2EngServer(data);
    //sendJsonRequestToEng2TektonServer("bodyData");
});

async function sendJsonRequestToJnk2EngServer(bodyData) {
    console.log("\n\n -- Sending Jenkins file to JNK2ENG Server -- \n\n");
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
        console.log("\n\n--\n" + final + "\n--");
        sendJsonRequestToEng2TektonServer(final);
    } catch (error) {
        console.error('Error:\n\n-----------------------\n', error);
    }
}

async function sendJsonRequestToEng2TektonServer(bodyData) {
    console.log("\n\n --\n Sending Jenkins file to ENG2TEK Server -- \n\n");
    try {
        const response = await axios.post(
            urleng2tkn,
            {
                "messages": [
                    {
                        "content": "Create a Tekton pipeline using the following description: " + bodyData,
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
        console.log(scrub1);
    } catch (error) {
        // console.error('Error:', error);
        // Read the Jenkinsfile
        fs.readFile(dummyTektonFilePath, 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading Tektonfile:', err);
                return;
            }
            console.log(data);
        });
    }
}
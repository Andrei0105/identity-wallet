// const { Credentials } = require('uport-credentials');
// console.log(Credentials.createIdentity());

const express = require('express')
const bodyParser = require('body-parser')
const ngrok = require('ngrok')
const decodeJWT = require('did-jwt').decodeJWT
const { Credentials } = require('uport-credentials')
const transports = require('uport-transports').transport
const message = require('uport-transports').message.util

let endpoint = ''
const app = express();
app.use(bodyParser.json({ type: '*/*' }))

let responseReceived = false;
let userCredential = null;
//setup Credentials object with newly created application identity.
const credentials = new Credentials({
    //test credentials
    appName: 'Server App',
    did: 'did:ethr:0xbe483f5184a3357a297dd971cfb7ac0a2a5e7abc',
    privateKey: '39c63b41e9b69cdf610ae23ddd6026eb826ad1902cfbcfa365c73edde52388af'
})

app.get('/', (req, res) => {
    credentials.createDisclosureRequest({
        requested: ["name"],
        notifications: true,
        callbackUrl: endpoint + '/callback'
    }).then(requestToken => {
        console.log(decodeJWT(requestToken))  //log request token to console
        const uri = message.paramsToQueryString(message.messageToURI(requestToken), { callback_type: 'post' })
        const qr = transports.ui.getImageDataURI(uri)
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.send(qr)
    })
})

app.get('/resp', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(responseReceived);
    if (responseReceived === true)
        responseReceived = false;
})

app.post('/callback', (req, res) => {
    const jwt = req.body.access_token
    console.log(jwt);
    responseReceived = true;
    credentials.authenticateDisclosureResponse(jwt).then(credentials => {
        console.log(credentials);
        userCredential = credentials;
        // Validate the information and apply authorization logic
    }).catch(err => {
        console.log(err)
    })
})

app.post('/callback_issue', (req, res) => {
    responseReceived = true;
})

app.get('/create_verification', (req, res) => {
    if (userCredential) {
        credentials.createVerification({
            sub: userCredential.did,
            exp: Math.floor(new Date().getTime() / 1000) + 30 * 24 * 60 * 60,
            claim: { 'Identity': { 'Last Seen': `${new Date()}` } },
            callbackUrl: endpoint + '/callback_issue'
        }).then(attestation => {
            console.log(`Encoded JWT sent to user: ${attestation}`)
            console.log(`Decodeded JWT sent to user: ${JSON.stringify(decodeJWT(attestation))}`)
            const uri = message.paramsToQueryString(message.messageToURI(attestation), { callback_type: 'post' })
            const qr = transports.ui.getImageDataURI(uri)
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.send(qr)
            userCredential = null;
        })
    }
    else {
        console.log('User not logged in!');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.send('User not logged in');
    }
})

// run the app server and tunneling service
const server = app.listen(8088, () => {
    ngrok.connect({ addr: 8088 }).then(ngrokUrl => {
        endpoint = ngrokUrl
        console.log(`Login Service running, open at ${endpoint}`)
    })
})
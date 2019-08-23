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

app.post('/callback', (req, res) => {
    const jwt = req.body.access_token
    console.log(jwt);
    credentials.authenticateDisclosureResponse(jwt).then(credentials => {
        console.log(credentials);
        // Validate the information and apply authorization logic
    }).catch(err => {
        console.log(err)
    })
})

// run the app server and tunneling service
const server = app.listen(8088)
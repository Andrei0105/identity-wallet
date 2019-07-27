window.test = true;

function checkVariable() {
    if (typeof window.uportconnect !== "undefined") {
        // getCreds();
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { type: "requestData" }, function (data) {
                console.log(tabs[0].url)
                simple = data.simple;
                verified = data.verified;
                getCreds(simple, verified);
            });
        });
    }
}

function checkVariableStorage() {
    if (typeof window.uportconnect !== "undefined") {
        chrome.storage.local.get(['tab_id'], function (data) {
            tab_id = data.tab_id;
            // chrome.tabs.sendMessage(tab_id, { type: "requestData" }, undefined, function (data) {
            chrome.storage.local.get(['requestedData'], function (data) {
                simple = data.simple;
                verified = data.verified;
                console.log('received data', simple, verified);
                window.test ? getCredsTester(tab_id, simple, verified) : getCreds(tab_id, simple, verified);
            });
        });
    }
}

function getCreds(targetTabId, simple, verified) {
    const Connect = window.uportconnect;
    const uport = new Connect('MyDApp');
    console.log('done');

    //TO DO: hide the uport wrapper and get the JWT
    uport.requestDisclosure({
        requested: simple,//['name', 'country'],
        verified: verified//['Example', 'Diploma']
    })

    uport.onResponse('disclosureReq').then(res => {
        json = res.payload
        jsonString = JSON.stringify(json)
        console.log('JSON response:\n' + jsonString)
        qrImage = document.getElementById('qr-code')
        qrImage.remove()
        document.querySelector('#msg').innerHTML = "Congratulations you are now <b>logged in</b>`.  Here is your DID identifier:  " + json.did
        // chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        //     console.log('Messaged tab: ' + tabs[0].url)
        //     chrome.tabs.sendMessage(tabs[0].id, { action: "fillFields", name: json.name, country: json.country });
        // });
        chrome.tabs.sendMessage(targetTabId, { type: "fillFields", name: json.name, country: json.country });
    })
}

function getCredsTester(targetTabId, simple, verified) {
    json = { "did": "did:ethr:example", "name": "Example name", "country": "United Kingdom", "Example": { "Last Seen": "Wed Jul 10 2019 15:17:53 GMT+0100 (British Summer Time)" }, "Diploma": { "School Name": "The University of uPortlandia", "Program Name": "French linguistics", "Graduation Year": "2019", "Final Grades": "B+" }, "verified": [{ "iat": 1562768275, "sub": "did:ethr:0x5bef38cb3ebff1ed7e3f140f338a2f2630fa55ff", "claim": { "Example": { "Last Seen": "Wed Jul 10 2019 15:17:53 GMT+0100 (British Summer Time)" } }, "exp": 1565360273, "vc": ["/ipfs/QmXsk5Ago2a9Zuo8kJXUGDxYCajL8Pc3qFrHksY9jer9UF", "/ipfs/QmXdFd2Knx3mD6utYpVXZct5ytFEqcoZX7mJyqwAEhfPd4"], "iss": "did:ethr:0x07ffd720f03e4dfd1252002ac6705ab80ad87349", "jwt": "eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQiOjE1NjI3NjgyNzUsInN1YiI6ImRpZDpldGhyOjB4NWJlZjM4Y2IzZWJmZjFlZDdlM2YxNDBmMzM4YTJmMjYzMGZhNTVmZiIsImNsYWltIjp7IkV4YW1wbGUiOnsiTGFzdCBTZWVuIjoiV2VkIEp1bCAxMCAyMDE5IDE1OjE3OjUzIEdNVCswMTAwIChCcml0aXNoIFN1bW1lciBUaW1lKSJ9fSwiZXhwIjoxNTY1MzYwMjczLCJ2YyI6WyIvaXBmcy9RbVhzazVBZ28yYTladW84a0pYVUdEeFlDYWpMOFBjM3FGckhrc1k5amVyOVVGIiwiL2lwZnMvUW1YZEZkMktueDNtRDZ1dFlwVlhaY3Q1eXRGRXFjb1pYN21KeXF3QUVoZlBkNCJdLCJpc3MiOiJkaWQ6ZXRocjoweDA3ZmZkNzIwZjAzZTRkZmQxMjUyMDAyYWM2NzA1YWI4MGFkODczNDkifQ.bSMkhZKrGvJBzECYGqMIHe6sSv65tHmH_bO1vdLtUw7x09KDDNXbQMkNd1qAAcN0QduLMrluzjoeJfnE1R1Z3QA" }, { "iat": 1562672656, "sub": "did:ethr:0x5bef38cb3ebff1ed7e3f140f338a2f2630fa55ff", "claim": { "Diploma": { "School Name": "The University of uPortlandia", "Program Name": "French linguistics", "Graduation Year": "2019", "Final Grades": "B+" } }, "vc": ["/ipfs/Qmc25fEYnAayi55P526w1TtJZx4gZDoDgtjHhrCUKCfDSU"], "callbackUrl": "https://api.uport.me/chasqui/topic/_ZHWzerEu", "iss": "did:ethr:0xf25357579f64eb14b6bdfefbc752bea7c77819a1", "jwt": "eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQiOjE1NjI2NzI2NTYsInN1YiI6ImRpZDpldGhyOjB4NWJlZjM4Y2IzZWJmZjFlZDdlM2YxNDBmMzM4YTJmMjYzMGZhNTVmZiIsImNsYWltIjp7IkRpcGxvbWEiOnsiU2Nob29sIE5hbWUiOiJUaGUgVW5pdmVyc2l0eSBvZiB1UG9ydGxhbmRpYSIsIlByb2dyYW0gTmFtZSI6IkZyZW5jaCBsaW5ndWlzdGljcyIsIkdyYWR1YXRpb24gWWVhciI6IjIwMTkiLCJGaW5hbCBHcmFkZXMiOiJCKyJ9fSwidmMiOlsiL2lwZnMvUW1jMjVmRVluQWF5aTU1UDUyNncxVHRKWng0Z1pEb0RndGpIaHJDVUtDZkRTVSJdLCJjYWxsYmFja1VybCI6Imh0dHBzOi8vYXBpLnVwb3J0Lm1lL2NoYXNxdWkvdG9waWMvX1pIV3plckV1IiwiaXNzIjoiZGlkOmV0aHI6MHhmMjUzNTc1NzlmNjRlYjE0YjZiZGZlZmJjNzUyYmVhN2M3NzgxOWExIn0.ygvP1qwg2ieZpkbMvg7Gk4PzpJwa1yuFg1o-r8bNIXFjVAHstESHCqr3k81RZhraUXxJFkPxrfTDOjAM7tAD5gE" }], "invalid": [] }
    jsonString = JSON.stringify(json)
    console.log('JSON response:\n' + jsonString)
    document.querySelector('#msg').innerHTML = "Congratulations you are now <b>logged in</b>`.  Here is your DID identifier:  " + json.did
    chrome.tabs.sendMessage(targetTabId, { type: "fillFields", name: json.name, country: json.country });
}

// Hiding the uPort wrapper on insertion using MutationObserver
// Select the node that will be observed for mutations
var targetNode = document.getElementById('body');

// Options for the observer (which mutations to observe)
var config = { childList: true };

// Callback function to execute when mutations are observed
var callback = function (mutationsList, observer) {
    for (var mutation of mutationsList) {
        if (mutation.addedNodes.length && mutation.addedNodes[0].id == 'uport-wrapper') {
            console.log('uPort wrapper was added');
            var uportWrapperDiv = document.getElementById('uport-wrapper');
            uportWrapperDiv.style.display = 'none';
            var imgDiv = document.getElementById('uport__modal-main')
            var imgs = imgDiv.getElementsByTagName("img");
            console.log("QR code src:\n" + imgs[0].src);
            show_image(imgs[0].src, 275, 275, 'qr-code')
        }
    }
};

// Create an observer instance linked to the callback function
var observer = new MutationObserver(callback);

// Start observing the target node for configured mutations
observer.observe(targetNode, config);

setTimeout(checkVariableStorage, 3000);

function show_image(src, width, height, id, alt) {
    var img = document.createElement("img");
    img.src = src;
    img.width = width;
    img.height = height;
    img.alt = alt;
    img.id = id;

    document.body.appendChild(img);
}
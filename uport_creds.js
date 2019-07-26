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
            chrome.tabs.sendMessage(tab_id, { type: "requestData" }, undefined, function (data) {
                simple = data.simple;
                verified = data.verified;
                console.log('received data', simple, verified);
                getCreds(tab_id, simple, verified);
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
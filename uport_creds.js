function checkVariable() {
    if (typeof window.uportconnect !== "undefined") {
        getCreds();
    }
}

function getCreds() {
    const Connect = window.uportconnect;
    const uport = new Connect('MyDApp');
    console.log('done');

    //TO DO: hide the uport wrapper and get the JWT
    uport.requestDisclosure()

    uport.onResponse('disclosureReq').then(res => {
        const did = res.payload.did
        json = JSON.stringify(res.payload)
        console.log(json)
        document.querySelector('#msg').innerHTML = "Congratulations you are now <b>logged in</b>`.  Here is your DID identifier:  " + json
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
        console.log('A child node has been added or removed.');
        var uportWrapperDiv = document.getElementById('uport-wrapper');
        uportWrapperDiv.style.display = 'none';
    }
};

// Create an observer instance linked to the callback function
var observer = new MutationObserver(callback);

// Start observing the target node for configured mutations
observer.observe(targetNode, config);

setTimeout(checkVariable, 3000);

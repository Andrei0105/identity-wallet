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
        qrImage = document.getElementById('qr-code')
        qrImage.remove()
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
        if (mutation.addedNodes.length && mutation.addedNodes[0].id == 'uport-wrapper')
        {
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

setTimeout(checkVariable, 3000);

function show_image(src, width, height, id, alt) {
    var img = document.createElement("img");
    img.src = src;
    img.width = width;
    img.height = height;
    img.alt = alt;
    img.id = id;

    document.body.appendChild(img);
}
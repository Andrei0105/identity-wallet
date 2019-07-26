
// chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
//     if (msg.action === "fillFields") {
//         $("#name").val(msg.name)
//         $("#country").val(msg.country)
//     }
// });

function requestPopup() {
    chrome.runtime.sendMessage({ type: "openPopup" });
}

window.pendingData = null;
// Listener for message from in page script
window.addEventListener('message', function (event) {
    message = event.data;
    if (message.type == 'uport-test') {
        console.log('Message from inpage received:\n' + JSON.stringify(message));
    }
    else if (message.type == 'iw-up-rc') {
        console.log('Message from inpage received:\n' + JSON.stringify(message));
        window.pendingData = message;
    }
    else if (message.type == 'open-popup') {
        console.log('CS: Open popup received.')
        requestPopup();
    }
});

function injectScript(file, node) {
    var th = document.getElementsByTagName(node)[0];
    var s = document.createElement('script');
    s.setAttribute('type', 'text/javascript');
    s.setAttribute('src', file);
    th.appendChild(s);
}

injectScript(chrome.extension.getURL('inpage.js'), 'head');

function listenerAction(data, messageType) {
    switch (messageType) {
        case "requestData":
            chrome.runtime.sendMessage(data);
            break;
        default:
            break;
    }
}

chrome.runtime.onMessage.addListener(
    function (message, sender, listenerAction) {
        console.log(message);
        switch (message.type) {
            case "requestData":
                {
                    console.log("CS: Received requestData");
                    console.log("Pending data:", window.pendingData)
                    listenerAction(pendingData, message.type);
                }
                break;
            case "fillFields":
                {
                    console.log('fill');
                    console.log(message)
                    $("#name").val(message.name);
                    $("#country").val(message.country);
                    break;
                }
            default:
                console.error("Unrecognised message: ", message);
        }
    }

);


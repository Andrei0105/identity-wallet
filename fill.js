
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (msg.action === "fillFields") {
        $("#name").val(msg.name)
        $("#country").val(msg.country)
    }
});

// Listener for message from in page script
window.addEventListener('message', function (event) {
    message = event.data;
    if (message.type == 'uport-test') {
        console.log('Message from inpage received:\n' + JSON.stringify(message));
    }
    else if (message.type == 'iw-up-rc') {
        console.log('Message from inpage received:\n' + JSON.stringify(message));
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


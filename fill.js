
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    console.log('here field')
    if (msg.action === "fillFields") {
        $("#user").val("name@email.com")
        $("#pw").val("pass123")
    }
});

function injectScript(file, node) {
    var th = document.getElementsByTagName(node)[0];
    var s = document.createElement('script');
    s.setAttribute('type', 'text/javascript');
    s.setAttribute('src', file);
    th.appendChild(s);
}
injectScript( chrome.extension.getURL('inpage.js'), 'head');


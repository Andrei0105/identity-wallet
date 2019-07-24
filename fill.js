
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (msg.action === "fillFields") {
        $("#name").val(msg.name)
        $("#country").val(msg.country)
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


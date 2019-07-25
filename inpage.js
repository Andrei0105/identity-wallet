window.ext = {};

window.ext.x = function x() {
    console.log(15);
}

function createButton(func) {
    var button = document.createElement("input");
    button.type = "button";
    button.value = "Send";
    button.onclick = func;
    button.id = "div-btn";

    var div = document.getElementById('div-button');
    div.appendChild(button);
}

function onClickSend() {
    console.log('func');
    window.postMessage({
        type: "uport-test",
        message: "Message from the page"
    }, "*")
}

function requestUportClaims(event) {
    data = event.data;
    window.postMessage({
        type: "iw-up-rc",
        simple: data.simple,
        verified: data.verified
    });
}

createButton(onClickSend);
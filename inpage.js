window.iw = { name: 'identitywallet' }

window.iw.requestUportClaims =
    function requestUportClaims(event) {
        data = event.data;
        window.postMessage({
            type: "iw-up-rc",
            simple: data.simple,
            verified: data.verified
        });
        iw.addMessageListener();
        iw.sendMessage('open-popup');
    }

window.iw.sendMessage = function sendMessage(type) {
    switch (type) {
        case 'open-popup':
            window.postMessage({
                type: "open-popup"
            });
            break;
        default:
            console.warn('Unrecognized message type.');
    }
}

window.iw.addMessageListener = function addMessageListener() {
    window.addEventListener('message', function (message) {
        message = message.data;
        console.log('IS:', 'Received message:', message);
        switch (message.type) {
            case 'uport-claims':
                window.iw.requestedClaims = message.claims;
                break;
            default:
                console.warn('IS:', 'Unrecognized message type received.');
        }
    }, true);
}

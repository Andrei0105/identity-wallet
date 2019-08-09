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

window.iw.requestBlockstackClaims =
    function requestBlockstackClaims(event) {
        data = event.data;
        iw.sendMessage('r-blockstack-login');
    }

window.iw.initiateAriesConnection =
    function initiateAriesConnection(event) {
        data = event.data;
        window.postMessage({
            type: "aries-connection-invite",
            invitation: data.invitation
        });
    }

window.iw.sendMessage = function sendMessage(type) {
    switch (type) {
        case 'open-popup':
            window.postMessage({
                type: "open-popup"
            });
            break;
        case 'r-blockstack-login':
            //generate auth request with the page's default parameters
            authReq = blockstack.makeAuthRequest();
            window.postMessage({
                type: "r-blockstack-login",
                auth: authReq
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

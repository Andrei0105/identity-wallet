window.iw = { name: 'identitywallet' }

window.iw.requestUportClaims =
    function requestUportClaims(event) {
        data = event.data;
        window.postMessage({
            type: "iw-up-rc",
            simple: data.simple,
            verified: data.verified
        });
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

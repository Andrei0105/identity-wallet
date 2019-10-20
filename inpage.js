// passing messages via the extension is always accepted by the user's agent
// this functionality is enabled on the page's agent
// however the extension needs to know which communication channel will be used
// until fixed to specify this some other way (e.g. message type)
// inpage_messages is true if message passing via the extension is used
window.iw = { name: 'identitywallet', inpage_messages: true }

window.iw.requestUportClaims =
    function requestUportClaims(event) {
        data = event.data;
        window.postMessage({
            type: "uport-requested-claims",
            simple: data.simple,
            verified: data.verified
        });
        iw.addMessageListener();
    }

window.iw.requestBlockstackClaims =
    function requestBlockstackClaims(event) {
        data = event.data;
        authReq = blockstack.makeAuthRequest();
        window.postMessage({
            type: "r-blockstack-login",
            auth: authReq
        });
    }

window.iw.initiateAriesConnection =
    function initiateAriesConnection(event) {
        window.postMessage({
            type: "aries-connection-invite",
            invitation: event.data.invitation,
            entity_name: event.data.entity_name,
            entity_url: event.data.entity_url,
            entity_message: event.data.entity_message
        });
        iw.addMessageListener();
    }

window.iw.notifyCredentialRequest =
    function notifyCredentialRequest(event) {
        window.postMessage({
            type: "aries-credential-request-initiated",
            credential_created_at: event.data.credential_created_at,
            entity_name: event.data.entity_name,
            entity_url: event.data.entity_url,
            entity_message: event.data.entity_message
        });
        iw.addMessageListener();
    }

window.iw.notifyProofRequest =
    function notifyProofRequest(event) {
        window.postMessage({
            type: "aries-proof-request-initiated",
            proof_request_created_at: event.data.proof_request_created_at,
            entity_name: event.data.entity_name,
            entity_url: event.data.entity_url,
            entity_message: event.data.entity_message
        });
        iw.addMessageListener();
    }

window.iw.sendAriesDirectMessage =
    function sendAriesDirectMessage(event) {
        window.postMessage({
            type: "aries-direct-message",
            message: event.data.message
        });
    }

window.iw.sendUportIssueQr =
    function sendUportIssueQr(qr_code) {
        window.postMessage({
            type: "uport-issue-credential-qr",
            qr_code: qr_code
        });
        iw.addMessageListener();
    }

window.iw.sendUportDisclosureQr =
    function sendUportDisclosureQr(qr_code) {
        window.postMessage({
            type: "uport-selective-disclosure-qr",
            qr_code: qr_code
        });
        iw.addMessageListener();
    }

window.iw.sendUportQr =
    function sendUportQr(qr_code, qr_type) {
        window.postMessage({
            type: "uport-all-qr",
            qr_code: qr_code,
            qr_type: qr_type
        });
        iw.addMessageListener();
    }

window.iw.sendUportServerResponseReceived =
    function sendUportServerResponseReceived() {
        window.postMessage({
            type: "uport-server-response-received"
        });
    }

uPortObserverCallback = function (mutationsList, observer) {
    for (var mutation of mutationsList) {
        if (mutation.addedNodes.length && mutation.addedNodes[0].id == 'uport-wrapper') {
            console.log('IS:', 'uPort wrapper was added');
            var uportWrapperDiv = document.getElementById('uport-wrapper');
            uportWrapperDiv.style.display = 'none';
            var imgDiv = document.getElementById('uport__modal-main')
            var imgs = imgDiv.getElementsByTagName("img");
            console.log('IS:', 'QR code src:\n', imgs[0].src);
            iw.sendUportQr(imgs[0].src);
        }
        if (mutation.removedNodes.length && mutation.removedNodes[0].id == 'uport-wrapper') {
            window.postMessage({
                type: "uport-received-response"
            });
        }
    }
}

window.iw.createAndStartObserver =
    function createAndStartObserver(target_node, config, callback) {
        var config = { childList: true };
        var observer = new MutationObserver(callback);
        observer.observe(target_node, config);
    }

window.iw.createAndStartUportObserver =
    function createAndStartUportObserver() {
        // TO DO: check if uport-wrapper is always added as a body child
        target_node = document.body;
        config = { childList: true };
        callback = uPortObserverCallback;
        iw.createAndStartObserver(target_node, config, callback)
    }

function csListener(message) {
    message = message.data;
    console.log('IS:', 'Received message:', message);
    switch (message.type) {
        case 'uport_claims':
            window.iw.requestedClaims = message.claims;
            break;
        case 'aries_connection_status':
            {
                if (message.status === 'accepted')
                    window.iw.ariesConnectionAccepted = true;
                else if (message.status === 'rejected')
                    window.iw.ariesConnectionAccepted = false;
                else
                    console.warn('Unknown response status');
                break;
            }
        case 'aries_credential_status':
            {
                if (message.status === 'accepted')
                    window.iw.ariesCredentialAccepted = true;
                else if (message.status === 'rejected')
                    window.iw.ariesCredentialAccepted = false;
                else
                    console.warn('Unknown response status');
                break;
            }
        case 'aries_proof_request_status':
            {
                if (message.status === 'accepted')
                    window.iw.ariesProofRequestAccepted = true;
                else if (message.status === 'rejected')
                    window.iw.ariesProofRequestAccepted = false;
                else
                    console.warn('Unknown response status');
                break;
            }
        default:
            console.warn('IS:', 'Unrecognized message type received.');
    }
}

// Listener for messages from content script (CS)
window.iw.addMessageListener = function addMessageListener() {
    // Remove the listener if it was previously set
    window.removeEventListener('message', csListener, true);
    window.addEventListener('message', csListener, true);
}

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
        window.postMessage({
            type: "aries-connection-invite",
            invitation: event.data.invitation
        });
        iw.addMessageListener();
    }

window.iw.notifyCredentialRequest =
    function notifyCredentialRequest(event) {
        window.postMessage({
            type: "aries-credential-request-initiated",
            credential_created_at: event.data.credential_created_at
        });
        iw.addMessageListener();
    }

window.iw.notifyProofRequest =
    function notifyProofRequest(event) {
        window.postMessage({
            type: "aries-proof-request-initiated",
            proof_request_created_at: event.data.proof_request_created_at
        });
        iw.addMessageListener();
    }

// Send message to content script (CS)
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

function csListener(message) {
    message = message.data;
    console.log('IS:', 'Received message:', message);
    switch (message.type) {
        case 'uport-claims':
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

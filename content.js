function injectScript(file, node) {
    var th = document.getElementsByTagName(node)[0];
    var s = document.createElement('script');
    s.setAttribute('type', 'text/javascript');
    s.setAttribute('src', file);
    th.appendChild(s);
}

injectScript(chrome.extension.getURL('inpage.js'), 'head');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

chrome.storage.local.get(['inpage_messaging'], async function (storageData) {
    // temporary until detection when script was injected
    await sleep(2000);
    window.postMessage({ type: 'inpage_messaging', value: storageData.inpage_messaging }, '*');
    console.log('CS:', 'Sent inpage messaging to page: ', storageData.inpage_messaging)
});


// Listener for messages from inpage.js (IS)
window.addEventListener('message', function (event) {
    message = event.data;
    console.log('CS:', 'Message received:\n' + JSON.stringify(message));
    switch (message.type) {
        case 'uport-requested-claims':
            {
                isListenerAction({ type: 'uportRequestClaims', simple: message.simple, verified: message.verified }, 'uportRequestClaims');
                break;
            }
        case 'uport-issue-credential-qr':
            {
                isListenerAction({ type: 'uportIssueCredentialQr', qr_code: message.qr_code }, 'uportIssueCredentialQr');
                break;
            }
        case 'uport-selective-disclosure-qr':
            {
                isListenerAction({ type: 'uportSelectiveDisclosureQr', qr_code: message.qr_code }, 'uportSelectiveDisclosureQr');
                break;
            }
        case 'uport-all-qr':
            {
                isListenerAction({ type: 'uportQr', qr_code: message.qr_code, qr_type: message.qr_type }, 'uportQr');
                break;
            }
        case 'r-blockstack-login':
            {
                isListenerAction({ type: 'blockstackLogin', auth: message.auth }, 'blockstackLogin');
                break;
            }
        case 'aries-connection-invite':
            {
                isListenerAction({ type: 'ariesConnectionInvite', invitation: message.invitation, entity_name: message.entity_name, entity_url: message.entity_url, entity_message: message.entity_message }, 'ariesConnectionInvite');
                break;
            }
        case 'aries-credential-request-initiated':
            {
                isListenerAction({ type: 'ariesCredentialExchangeStart', credential_created_at: message.credential_created_at, entity_name: message.entity_name, entity_url: message.entity_url, entity_message: message.entity_message, comm_type: message.comm_type }, 'ariesCredentialExchangeStart');
                break;
            }
        case 'aries-proof-request-initiated':
            {
                isListenerAction({ type: 'ariesProofExchangeStart', proof_request_created_at: message.proof_request_created_at, entity_name: message.entity_name, entity_url: message.entity_url, entity_message: message.entity_message }, 'ariesProofExchangeStart');
                break;
            }
        case 'aries-direct-message':
            {
                isListenerAction({ type: 'ariesDirectMessage', message: message.message }, 'ariesDirectMessage');
                break;
            }
        case 'uport-received-response':
            {
                isListenerAction({ type: 'uportReceivedResponse' }, 'uportReceivedResponse');
                break;
            }
        case 'uport-server-response-received':
            {
                isListenerAction({ type: 'uportServerResponseReceived' }, 'uportServerResponseReceived');
                break;
            }
        default:
            console.warn('CS:', 'Unrecognized message.');
    }
});

// Listener for messages from popup (P)
chrome.runtime.onMessage.addListener(
    function (message, sender, listenerAction) {
        console.log('CS:', 'Message received:\n' + JSON.stringify(message));
        switch (message.type) {
            case "requestData":
                {
                    console.warn('Requesting data via messaging is deprecated.');
                    pListenerAction(pendingData, message.type);
                }
                break;
            case "uport_claims_respomse":
                {
                    window.postMessage({ type: 'uport_claims', claims: message.data }, '*');
                    break;
                }
            case 'aries_connection':
                {
                    window.postMessage({ type: 'aries_connection_status', status: message.status }, '*');
                    break;
                }
            case 'aries_credential':
                {
                    window.postMessage({ type: 'aries_credential_status', status: message.status }, '*');
                    break;
                }
            case 'aries_proof_request':
                {
                    window.postMessage({ type: 'aries_proof_request_status', status: message.status }, '*');
                    break;
                }
            default:
                console.warn('CS:', 'Unrecognised message: ', message);
        }
    }
);

function isListenerAction(data, messageType) {
    switch (messageType) {
        case 'blockstackLogin':
        case 'ariesConnectionInvite':
        case 'ariesCredentialExchangeStart':
        case 'ariesProofExchangeStart':
        case 'ariesDirectMessage':
        case 'uportIssueCredentialQr':
        case 'uportSelectiveDisclosureQr':
        case 'uportQr':
        case 'uportReceivedResponse':
        case 'uportServerResponseReceived':
        case 'uportRequestClaims':
            chrome.runtime.sendMessage(data);
            break;
        default:
            console.warn('CS:', 'Unrecognised message type: ', messageType);
    }
}

function pListenerAction(data, messageType) {
    switch (messageType) {
        case 'requestData':
            chrome.runtime.sendMessage(data);
            break;
        default:
    }
}




function injectScript(file, node) {
    var th = document.getElementsByTagName(node)[0];
    var s = document.createElement('script');
    s.setAttribute('type', 'text/javascript');
    s.setAttribute('src', file);
    th.appendChild(s);
}

injectScript(chrome.extension.getURL('inpage.js'), 'head');

// window.pendingData = null;

// Listener for messages from inpage.js (IS)
window.addEventListener('message', function (event) {
    message = event.data;
    console.log('CS:', 'Message received:\n' + JSON.stringify(message));
    switch (message.type) {
        case 'iw-up-rc':
            {
                chrome.storage.local.set({ 'requestedData': message });
                // window.pendingData = messsage;
                break;
            }
        case 'open-popup':
            {
                isListenerAction({ type: 'openPopup' }, 'openPopup');
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
                isListenerAction({ type: 'uportQr', qr_code: message.qr_code }, 'uportQr');
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
                isListenerAction({ type: 'ariesCredentialExchangeStart', credential_created_at: message.credential_created_at, entity_name: message.entity_name, entity_url: message.entity_url, entity_message: message.entity_message }, 'ariesCredentialExchangeStart');
                break;
            }
        case 'aries-proof-request-initiated':
            {
                isListenerAction({ type: 'ariesProofExchangeStart', proof_request_created_at: message.proof_request_created_at, entity_name: message.entity_name, entity_url: message.entity_url, entity_message: message.entity_message }, 'ariesProofExchangeStart');
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
            case "fillFields":
                {
                    $("#name").val(message.name);
                    $("#country").val(message.country);
                    window.postMessage({ type: 'uport-claims', claims: message.data }, '*');
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
        case 'openPopup':
        case 'blockstackLogin':
        case 'ariesConnectionInvite':
        case 'ariesCredentialExchangeStart':
        case 'ariesProofExchangeStart':
        case 'uportIssueCredentialQr':
        case 'uportSelectiveDisclosureQr':
        case 'uportQr':
        case 'uportReceivedResponse':
        case 'uportServerResponseReceived':
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




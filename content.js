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
        case 'r-blockstack-login':
            {
                isListenerAction({ type: 'blockstackLogin', auth: message.auth }, 'blockstackLogin');
                break;
            }
        case 'aries-connection-invite':
            {
                isListenerAction({ type: 'ariesConnectionInvite', invitation: message.invitation }, 'ariesConnectionInvite');
                break;
            }
        case 'aries-credential-request-initiated':
            {
                isListenerAction({ type: 'ariesCredentialExchangeStart', credential_created_at: message.credential_created_at }, 'ariesCredentialExchangeStart');
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
            chrome.runtime.sendMessage(data);
        default:
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




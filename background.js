chrome.runtime.onInstalled.addListener(function () {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({
        pageUrl: { hostEquals: '*' },
      })
      ],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
});

// Listener for messages from content script (CS)
chrome.runtime.onMessage.addListener(
  function (message, sender) {
    console.log('BG:', 'Received message:', message);
    switch (message.type) {
      case 'openPopup':
        {
          chrome.storage.local.set({ 'tab_id': sender.tab.id });
          window.open("popups/popup_uport.html", "extension_popup", "width=350,height=450,status=no,scrollbars=yes,resizable=no");
          break;
        }
      case 'blockstackLogin':
        {
          chrome.storage.local.set({ 'auth_req': message.auth });
          window.blockstack_popup = window.open("popups/popup_blockstack.html", "extension_popup", "width=350,height=450,status=no,scrollbars=yes,resizable=no");
          break;
        }
      case 'ariesConnectionInvite':
        {
          chrome.storage.local.set({ 'aries_invitation': message.invitation, 'tab_id': sender.tab.id });
          window.open("popups/popup_aries.html", "extension_popup", "width=350,height=450,status=no,scrollbars=yes,resizable=no");
          break;
        }
      case 'ariesCredentialExchangeStart':
        {
          chrome.storage.local.set({ 'aries_credential_created_at': message.credential_created_at, 'tab_id': sender.tab.id });
          window.open("popups/popup_aries_credential.html", "extension_popup", "width=350,height=450,status=no,scrollbars=yes,resizable=no");
          break;
        }
      case 'ariesProofExchangeStart':
        {
          chrome.storage.local.set({ 'aries_proof_request_created_at': message.proof_request_created_at, 'tab_id': sender.tab.id });
          window.open("popups/popup_aries_proof.html", "extension_popup", "width=350,height=450,status=no,scrollbars=yes,resizable=no");
          break;
        }
      default:
        console.warn('BG:', 'Unrecognized message: ', request)
    }
  });
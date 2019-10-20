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
      case 'uportRequestClaims':
        {
          chrome.storage.local.set({ 'requestedData': message, 'tab_id': sender.tab.id });
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
          chrome.storage.local.set({ 'aries_invitation': message.invitation, 'tab_id': sender.tab.id, 'entity_name': message.entity_name, 'entity_url': message.entity_url, 'entity_message': message.entity_message });
          window.open("popups/popup_aries.html", "extension_popup", "width=350,height=450,status=no,scrollbars=yes,resizable=no");
          break;
        }
      case 'ariesCredentialExchangeStart':
        {
          chrome.storage.local.set({ 'aries_credential_created_at': message.credential_created_at, 'tab_id': sender.tab.id, 'entity_name': message.entity_name, 'entity_url': message.entity_url, 'entity_message': message.entity_message });
          window.open("popups/popup_aries_credential.html", "extension_popup", "width=350,height=450,status=no,scrollbars=yes,resizable=no");
          break;
        }
      case 'ariesProofExchangeStart':
        {
          chrome.storage.local.set({ 'aries_proof_request_created_at': message.proof_request_created_at, 'tab_id': sender.tab.id, 'entity_name': message.entity_name, 'entity_url': message.entity_url, 'entity_message': message.entity_message });
          window.open("popups/popup_aries_proof.html", "extension_popup", "width=350,height=450,status=no,scrollbars=yes,resizable=no");
          break;
        }
      case 'ariesDirectMessage':
        {
          // to do: endpoint in options
          $.post('agent_messaging_endpoint', message.message,
            function (data, status, jqXHR) {
              console.log('BG:', 'Response from raw message: ', data);
            });
          break;
        }
      case 'uportIssueCredentialQr':
        {
          chrome.storage.local.set({ 'uport_issue_credetial_qr': message.qr_code, 'tab_id': sender.tab.id });
          window.open("popups/popup_uport_issue.html", "extension_popup", "width=350,height=450,status=no,scrollbars=yes,resizable=no");
          break;
        }
      case 'uportSelectiveDisclosureQr':
        {
          chrome.storage.local.set({ 'uport_selective_disclosure_qr': message.qr_code, 'tab_id': sender.tab.id });
          window.open("popups/popup_uport_all.html", "extension_popup", "width=350,height=450,status=no,scrollbars=yes,resizable=no");
          break;
        }
      case 'uportQr':
        {
          // case for both selective disclosure and issue credential
          chrome.storage.local.set({ 'uport_qr': message.qr_code, 'uport_qr_type': message.qr_type, 'tab_id': sender.tab.id });
          window.open("popups/popup_uport_all.html", "extension_popup", "width=350,height=450,status=no,scrollbars=yes,resizable=no");
          break;
        }
      case 'uportReceivedResponse':
        {
          // response from uPort was received. popup can be closed
          popup = window.open("popups/popup_uport_all.html", "extension_popup");
          popup.close();
          break;
        }
      case 'uportServerResponseReceived':
        {
          // response from uPort server side app was received. popup can be closed
          popup = window.open("popups/popup_uport_all.html", "extension_popup");
          popup.close();
          break;
        }
      default:
        console.warn('BG:', 'Unrecognized message: ', request)
    }
  });
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

chrome.runtime.onMessage.addListener(
  function (message, sender) {
    console.log('BG:', 'Received message:', message);
    switch (message.type) {
      case 'openPopup':
        {
          chrome.storage.local.set({ 'tab_id': sender.tab.id });
          window.open("popup_extension.html", "extension_popup", "width=350,height=450,status=no,scrollbars=yes,resizable=no");
          break;
        }
      case 'blockstackLogin':
        {
          chrome.storage.local.set({ 'auth_req': message.auth });
          window.blockstack_popup = window.open("popup_blockstack.html", "extension_popup", "width=350,height=450,status=no,scrollbars=yes,resizable=no");
          break;
        }
      default:
        console.warn('BG:', 'Unrecognized message: ', request)
    }
  });
chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.sync.set({ color: '#3aa757' }, function () {
    console.log("The color is green.");
  });

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
  function (request, sender) {
    if (request.type == 'openPopup') {
      console.log('BG: received open popup from CS');
      chrome.storage.local.set({ 'tab_id': sender.tab.id });
      window.open("popup_fill.html", "extension_popup", "width=300,height=400,status=no,scrollbars=yes,resizable=no");
    }
  });
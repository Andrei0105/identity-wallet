$("#fill").on("click", function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "fillFields", name: "Testname", country: "Testcountry" });
    });
});

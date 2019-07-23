$("#fill").on("click", function () {
    // chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    //     console.log(tabs[0].url);
    //     chrome.tabs.executeScript(
    //         tabs[0].id,
    //         { //code: 'document.body.style.backgroundColor = "' + color + '";'
    //             file: 'fill.js'
    //         });
    // });

    // chrome.runtime.sendMessage({
    //     action: 'fillFields',
    // });
    debugger;
    console.log('here')
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        console.log(tabs[0].url);
        chrome.tabs.sendMessage(tabs[0].id, { action: "fillFields" }, function (response) {
            console.log(response.farewell);
        });
    });
});



// fill.onclick = function (element) {
//     // let color = element.target.value;
//     chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
//         console.log(tabs[0].url);
//         chrome.tabs.executeScript(
//             tabs[0].id,
//             { //code: 'document.body.style.backgroundColor = "' + color + '";'
//                 file: 'fill.js'
//             });
//     });
// };
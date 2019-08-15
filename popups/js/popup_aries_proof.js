function displayProof() {
    chrome.storage.local.get(['aries_proof_request_created_at', 'aries_endpoint', 'tab_id'], async function (storageData) {
        // display received timestamp for test
        document.querySelector('#msg').innerHTML = storageData.aries_proof_request_created_at;
    });
}

$(document).ready(function () {
    displayProof();
});
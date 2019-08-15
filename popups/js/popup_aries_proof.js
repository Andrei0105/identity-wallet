function displayProof() {
    chrome.storage.local.get(['aries_proof_request_created_at', 'aries_endpoint', 'tab_id'], async function (storageData) {
        // display received timestamp for test
        document.querySelector('#msg').innerHTML = storageData.aries_proof_request_created_at;
        window.tab_id = storageData.tab_id;
        window.proof_request_created_at = storageData.aries_proof_request_created_at;
        window.aries_endpoint = storageData.aries_endpoint;
        newest_presentation_exchange = undefined;
        while (typeof newest_presentation_exchange === 'undefined') {
            await sleep(1000);
            await $.get(storageData.aries_endpoint + '/presentation_exchange',
                function (data, status, jqXHR) {
                    presentation_exchanges = data.results;
                    presentation_exchanges.sort(sortByDate);
                    newest_presentation_exchange = presentation_exchanges.find(function (element) {
                        console.log(element.created_at, window.proof_request_created_at)
                        return (new Date(element.created_at)).getTime() - window.proof_request_created_at < 5000;
                    });
                });
        }
        window.aries_presentation_exchange_id = newest_presentation_exchange.presentation_exchange_id;
        document.querySelector('#msg').innerHTML = JSON.stringify(newest_presentation_exchange);
    });
}

$(document).ready(function () {
    displayProof();
});

function sortByDate(a, b) {
    return new Date(b.updated_at) - new Date(a.updated_at);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
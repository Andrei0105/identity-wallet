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
        console.log(newest_presentation_exchange)
        ////// temporary for testing
        window.attr_ref = Object.keys(newest_presentation_exchange.presentation_request.requested_attributes)[0]
        window.pred_ref = Object.keys(newest_presentation_exchange.presentation_request.requested_predicates)[0]
        //////
        window.aries_presentation_exchange_id = newest_presentation_exchange.presentation_exchange_id;
        document.querySelector('#msg').innerHTML = JSON.stringify(newest_presentation_exchange);
    });
}

function createPresentation() {
    // return hardcoded presentation for testing
    return '{\
        "self_attested_attributes": {},\
        "requested_attributes": {\
            "' + window.attr_ref + '": {\
                "cred_id": "c0d97166-b9a7-4f87-8bcb-689cf862ebfa",\
                "revealed": true\
            }\
        },\
        "requested_predicates": {\
            "' + window.pred_ref + '": {\
                "cred_id": "c0d97166-b9a7-4f87-8bcb-689cf862ebfa"\
            }\
        }\
    }'
}

async function sendPresentation(presentation) {
    response = await $.post(window.aries_endpoint + '/presentation_exchange/' + window.aries_presentation_exchange_id + '/send_presentation', presentation)
    console.log('Presentation sent. Response:', response);
    chrome.tabs.sendMessage(window.tab_id, { type: 'aries_proof_request', status: 'accepted' });
}

async function acceptPresentationRequest() {
    await sendPresentation(createPresentation());
    self.close();
}

$(document).ready(function () {
    $('#aries_accept').click(acceptPresentationRequest);
    displayProof();
});

function sortByDate(a, b) {
    return new Date(b.updated_at) - new Date(a.updated_at);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
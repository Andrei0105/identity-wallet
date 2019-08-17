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
        console.log(JSON.stringify(newest_presentation_exchange))
        window.presentation_exchange = newest_presentation_exchange;
        await $.get(storageData.aries_endpoint + '/presentation_exchange/' + newest_presentation_exchange.presentation_exchange_id + '/credentials',
            function (data, status, jqXHR) {
                window.corresponding_credentials = data;
                console.log('Corresponding credentials:', JSON.stringify(data))
            });
        ////// temporary for testing
        window.attr_ref = Object.keys(newest_presentation_exchange.presentation_request.requested_attributes)[0]
        window.pred_ref = Object.keys(newest_presentation_exchange.presentation_request.requested_predicates)[0]
        //////
        window.aries_presentation_exchange_id = newest_presentation_exchange.presentation_exchange_id;
        document.querySelector('#msg').innerHTML = JSON.stringify(newest_presentation_exchange);
    });
}

function createPresentation(presentation_exchange, corresponding_credentials) {

    // return hardcoded presentation for testing
    // presentation = '{\
    //     "self_attested_attributes": {},\
    //     "requested_attributes": {\
    //         "' + window.attr_ref + '": {\
    //             "cred_id": "d78f8ba2-7971-4155-866b-ba98e4842642",\
    //             "revealed": true\
    //         }\
    //     },\
    //     "requested_predicates": {\
    //         "' + window.pred_ref + '": {\
    //             "cred_id": "be682fe5-8fe0-44dd-9399-0cc57d503b31"\
    //         }\
    //     }\
    // }'

    presentation_exchange = window.presentation_exchange;
    corresponding_credentials = window.corresponding_credentials;

    // get the referents for the requested attributes and predicates
    // TO DO: check for self signed attributes
    requested_attr_referents = Object.keys(presentation_exchange.presentation_request.requested_attributes)
    requested_pred_referents = Object.keys(presentation_exchange.presentation_request.requested_predicates)

    // map referents to credential ids
    referents_to_cred_ids = {}
    corresponding_credentials.forEach(function (credential_details) {
        credential_id = credential_details.cred_info.referent;
        referents = credential_details.presentation_referents;
        referents.forEach(function (referent) {
            if(typeof referents_to_cred_ids[referent] == 'undefined')
                referents_to_cred_ids[referent] = [credential_id]
        });
    });
    console.log('Referents to credentials:', referents_to_cred_id);
    // generate the presentation
    presentation = { self_attested_attributes: {}, requested_attributes: {}, requested_predicates: {} };
    requested_attr_referents.forEach(function (referent) {
        corresponding_credential_id = referents_to_cred_ids[referent][0]
        presentation.requested_attributes[referent] = {cred_id: corresponding_credential_id, revealed: true};
    });
    requested_pred_referents.forEach(function (referent) {
        corresponding_credential_id = referents_to_cred_ids[referent][0]
        presentation.requested_predicates[referent] = {cred_id: corresponding_credential_id};
    });
    console.log('Generated presentation:', presentation);
    return presentation;
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

function rejectPresentationRequest() {
    chrome.tabs.sendMessage(window.tab_id, { type: 'aries_proof_request', status: 'rejected' });
    self.close();
}

$(document).ready(function () {
    $('#aries_accept').click(acceptPresentationRequest);
    $('#aries_reject').click(rejectPresentationRequest);
    displayProof();
});

function sortByDate(a, b) {
    return new Date(b.updated_at) - new Date(a.updated_at);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
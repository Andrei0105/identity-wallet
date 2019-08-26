function displayProof() {
    chrome.storage.local.get(['aries_proof_request_created_at', 'aries_endpoint', 'tab_id', 'entity_name', 'entity_url', 'entity_message'], async function (storageData) {
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
        if (storageData.entity_name) {
            document.querySelector('#received_from_entity').innerHTML = 'Proof request received from ' + storageData.entity_name + ' available at ' + storageData.entity_url;
        }
        connection_details = await getConnection(newest_presentation_exchange.connection_id);
        document.querySelector('#label_and_endpoint').innerHTML = 'Sender Agent label: ' + connection_details.their_label;
        if (storageData.entity_message) {
            document.querySelector('#message_from_entity').innerHTML = storageData.entity_message;
        }
        corresponding_credentials = undefined;
        await $.get(storageData.aries_endpoint + '/presentation_exchange/' + newest_presentation_exchange.presentation_exchange_id + '/credentials',
            function (data, status, jqXHR) {
                corresponding_credentials = data;
                console.log('Corresponding credentials:', data)
            });
        window.referents_to_cred_ids = getCredentialsForPresentationReferents(newest_presentation_exchange, corresponding_credentials);
        ////// temporary for testing
        window.attr_ref = Object.keys(newest_presentation_exchange.presentation_request.requested_attributes)[0]
        window.pred_ref = Object.keys(newest_presentation_exchange.presentation_request.requested_predicates)[0]
        //////
        window.aries_presentation_exchange_id = newest_presentation_exchange.presentation_exchange_id;
        document.querySelector('#msg').innerHTML = JSON.stringify(newest_presentation_exchange);
        displayCredentialSelects(referents_to_cred_ids);
    });
}

function displayCredentialSelects(referents_to_cred_ids) {
    function createSelect(parent, referent, cred_ids) {
        label = document.createElement('label');
        label.innerHTML = referent;
        parent.appendChild(label);
        select = document.createElement('select');
        select.id = referent;
        select.className = 'form-control';
        parent.appendChild(select);
        cred_ids.forEach(function (credential) {
            option = document.createElement('option');
            option.value = credential;
            option.text = credential;
            select.appendChild(option);
        });
    }
    for (referent in referents_to_cred_ids) {
        createSelect(document.getElementById('cred_select_div'), referent, referents_to_cred_ids[referent]);
    }
}

function getCredentialsForPresentationReferents(presentation_exchange, corresponding_credentials) {
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
            if (typeof referents_to_cred_ids[referent] == 'undefined')
                referents_to_cred_ids[referent] = [credential_id]
            else
                referents_to_cred_ids[referent].push(credential_id);
        });
    });
    console.log('Referents to credentials:', referents_to_cred_ids);
    return referents_to_cred_ids;
}

function createPresentation(referents_to_cred_ids) {

    // return hardcoded presentation for testing
    // presentation = '{\
    //     "self_attested_attributes": {},\
    //     "requested_attributes": {\
    //         "' + window.attr_ref + '": {\
    //             "cred_id": "811b2c17-0ccb-489b-a2c9-682063d9d1be",\
    //             "revealed": true\
    //         }\
    //     },\
    //     "requested_predicates": {\
    //         "' + window.pred_ref + '": {\
    //             "cred_id": "811b2c17-0ccb-489b-a2c9-682063d9d1be"\
    //         }\
    //     }\
    // }'

    referents_to_cred_ids = window.referents_to_cred_ids;

    // generate the presentation
    presentation = { self_attested_attributes: {}, requested_attributes: {}, requested_predicates: {} };
    requested_attr_referents.forEach(function (referent) {
        // corresponding_credential_id = referents_to_cred_ids[referent][0]
        corresponding_credential_id = document.getElementById(referent).value;
        presentation.requested_attributes[referent] = { cred_id: corresponding_credential_id, revealed: true };
    });
    requested_pred_referents.forEach(function (referent) {
        // corresponding_credential_id = referents_to_cred_ids[referent][0]
        corresponding_credential_id = document.getElementById(referent).value;
        presentation.requested_predicates[referent] = { cred_id: corresponding_credential_id };
    });
    presentation = JSON.stringify(presentation);
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

async function getConnection(connection_id) {
    connection = await $.get(window.aries_endpoint + '/connections/' + connection_id)
    return connection;
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
function displayCredentialPresentationDetails() {
    chrome.storage.local.get(['aries_credential_created_at', 'aries_endpoint', 'tab_id', 'entity_name', 'entity_url', 'entity_message'], async function (storageData) {
        window.tab_id = storageData.tab_id;
        window.credential_created_at = storageData.aries_credential_created_at;
        window.aries_endpoint = storageData.aries_endpoint;
        newest_cred_exchange = undefined;
        while (typeof newest_cred_exchange === 'undefined') {
            await sleep(1000);
            await $.get(storageData.aries_endpoint + '/credential_exchange',
                function (data, status, jqXHR) {
                    cred_exchanges = data.results;
                    // remove credential exchange records
                    // cred_exchanges.forEach(element => {
                    //     $.post(window.aries_endpoint + '/credential_exchange/' + element.credential_exchange_id + '/remove')
                    // });
                    cred_exchanges.sort(sortByDate);
                    // newest_cred_exchange = cred_exchanges[0];
                    newest_cred_exchange = cred_exchanges.find(function (element) {
                        console.log(element.created_at, window.credential_created_at)
                        // return element.created_at == window.credential_created_at;
                        // TO DO: find another way to match credential exchange on the page's agent to the one on the user's agent
                        return (new Date(element.created_at)).getTime() - (new Date(window.credential_created_at)).getTime() < 5000;
                    });
                    console.log(newest_cred_exchange)
                });
        }

        connection_id = newest_cred_exchange.connection_id;
        connectionAvailable = await utils.checkConnection(storageData.aries_endpoint, connection_id);
        if (connectionAvailable) {
            // retrieve the attribute names from the credential offer
            attribute_names = newest_cred_exchange.credential_offer.key_correctness_proof.xr_cap.map(element => element[0]).filter(function (value, index, arr) {
                return value != 'master_secret';
            });

            document.querySelector('#attribute_names').innerHTML = 'The credential offer contains the following attributes: ' + attribute_names.join(', ') + '.';
            if (storageData.entity_name) {
                document.querySelector('#received_from_entity').innerHTML = 'Credential offer received from ' + storageData.entity_name + ' available at ' + storageData.entity_url;
            }
            connection_details = await getConnection(newest_cred_exchange.connection_id);
            document.querySelector('#label_and_endpoint').innerHTML = 'Sender Agent label: ' + connection_details.their_label;
            if (storageData.entity_message) {
                document.querySelector('#message_from_entity').innerHTML = storageData.entity_message;
            }
            window.aries_popup_cred_exchange_id = newest_cred_exchange.credential_exchange_id;
            chrome.storage.local.set({ 'aries_popup_cred_exchange_id': newest_cred_exchange.credential_exchange_id });
            document.querySelector('#msg').innerHTML = JSON.stringify(newest_cred_exchange);
        }
        else {
            displayError('Connection not available.');
        }
    });
}

async function requestAndDisplayCredential() {
    document.querySelector('#attribute_msg').innerHTML = 'The following credential was received:';
    await $.post(window.aries_endpoint + '/credential_exchange/' + window.aries_popup_cred_exchange_id + '/send-request')
    credential = await $.get(window.aries_endpoint + '/credential_exchange/' + window.aries_popup_cred_exchange_id)
    while (credential.state != "credential_received") {
        await sleep(1000);
        console.log('Credential state:', credential.state);
        credential = await $.get(window.aries_endpoint + '/credential_exchange/' + window.aries_popup_cred_exchange_id)
    }
    attributes = {}
    attributes_string = '<ul>'
    for (attribute in credential.raw_credential.values) {
        attributes[attribute] = credential.raw_credential.values[attribute].raw;
        attributes_string += '<li>' + attribute + ': ' + credential.raw_credential.values[attribute].raw + '</li>'
    }
    attributes_string += '</ul>'
    document.querySelector('#attributes').innerHTML = attributes_string;
    $("#aries_accept").html('Accept');
    $('#aries_accept').unbind('click', requestAndDisplayCredential);
    $('#aries_accept').click(acceptCredential);
}

async function acceptCredential() {
    await $.post(window.aries_endpoint + '/credential_exchange/' + window.aries_popup_cred_exchange_id + '/store',
        async function (data, status, jqXHR) {
            console.log('Stored credential. Response:', data);
            credential_data = undefined;
            while (!credential_data) {
                try {
                    credential_data = await $.get(window.aries_endpoint + '/credential/' + data.credential_id)
                    console.log('Credential: ', credential_data)
                }
                catch (err) {
                    // TO DO: TIMEOUT
                    if (err.status === 404)
                        console.log('Credential not yet stored!');
                    await sleep(1000);
                }
            } //to do: send message in case of timeout expiration
            chrome.tabs.sendMessage(window.tab_id, { type: 'aries_credential', status: 'accepted' });
        });
    self.close();
}

function rejectCredential() {
    chrome.tabs.sendMessage(window.tab_id, { type: 'aries_credential', status: 'rejected' });
    self.close();
}

async function getConnection(connection_id) {
    connection = await $.get(window.aries_endpoint + '/connections/' + connection_id)
    return connection;
}

function displayError(message) {
    $('#main_div').addClass('d-none');
    $('#error_div').removeClass('d-none');
    $('#error_msg').html(message);
}

function closePopup() {
    self.close();
}

$(document).ready(function () {
    chrome.storage.local.get(['aries_endpoint'], async function (storageData) {
        agentAvailable = await utils.checkAgentAvailability(storageData.aries_endpoint);
        if (agentAvailable) {
            displayCredentialPresentationDetails();
        }
        else {
            displayError('Agent not available. Check agent endpoint settings.');
        }
    });
    $('#aries_accept').click(requestAndDisplayCredential);
    $('#aries_reject').click(rejectCredential);
    $('#close_popup').click(closePopup);
});

function sortByDate(a, b) {
    return new Date(b.updated_at) - new Date(a.updated_at);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
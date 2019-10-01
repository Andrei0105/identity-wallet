function displayInvitation() {
    chrome.storage.local.get(['aries_invitation', 'entity_name', 'entity_url', 'entity_message'], function (data) {
        invitation = data.aries_invitation;
        console.log('BG:', 'Read invitation from storage: ', invitation);
        invitation_obj = JSON.parse(invitation)
        console.log(invitation_obj)
        if (data.entity_name) {
            document.querySelector('#received_from_entity').innerHTML = 'Connection invite received from ' + data.entity_name + ' available at ' + data.entity_url;
        }
        document.querySelector('#label_and_endpoint').innerHTML = 'Sender Agent label: ' + invitation_obj.label + '<br>Sender Agent endpoint: ' + invitation_obj.serviceEndpoint;
        if (data.entity_message) {
            document.querySelector('#message_from_entity').innerHTML = data.entity_message;
        }
        document.querySelector('#msg').innerHTML = invitation;
    });
}

function acceptInvitation() {
    chrome.storage.local.get(['aries_invitation', 'aries_endpoint', 'tab_id'], function (storageData) {
        $.post(storageData.aries_endpoint + '/connections/receive-invitation',
            storageData.aries_invitation, function (data, status, jqXHR) {
                connection_id = data.connection_id;
                $.post(storageData.aries_endpoint + '/connections/' + connection_id + '/accept-invitation',
                    async function (data, status, jqXHR) {
                        console.log(data);
                        connection_details = await $.get(storageData.aries_endpoint + '/connections/' + connection_id)
                        while (connection_details.state != 'request') {
                            console.log(connection_details.state);
                            await sleep(1000);
                        }
                        // TO DO: failure after an interval
                        chrome.tabs.sendMessage(storageData.tab_id, { type: 'aries_connection', status: 'accepted' });
                        self.close();
                    });
            });
    });
}

function rejectInvitation() {
    chrome.storage.local.get(['tab_id'], function (storageData) {
        chrome.tabs.sendMessage(storageData.tab_id, { type: 'aries_connection', status: 'rejected' });
        self.close();
    });
}

function displayError() {
    $('#main_div').addClass('d-none');
    $('#error_div').removeClass('d-none');
    $('#error_msg').html('Agent not available. Check agent endpoint settings.');
}

function closePopup() {
    self.close();
}

$(document).ready(function () {
    chrome.storage.local.get(['aries_endpoint'], async function (storageData) {
        agentAvailable = await utils.checkAgentAvailability(storageData.aries_endpoint);
        if (agentAvailable) {
            displayInvitation();
        }
        else {
            displayError();
        }
    });
    $('#aries_accept').click(acceptInvitation);
    $('#aries_reject').click(rejectInvitation);
    $('#close_popup').click(closePopup);
});

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
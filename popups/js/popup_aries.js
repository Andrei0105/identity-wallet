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
                    function (data, status, jqXHR) {
                        console.log(data);
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

$(document).ready(function () {
    displayInvitation();
    $('#aries_accept').click(acceptInvitation);
    $('#aries_reject').click(rejectInvitation);
});
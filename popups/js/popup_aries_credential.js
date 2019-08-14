function displayCredential() {
    chrome.storage.local.get(['aries_credential_created_at', 'aries_endpoint'], async function (storageData) {
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
        window.aries_popup_cred_exchange_id = newest_cred_exchange.credential_exchange_id;
        chrome.storage.local.set({ 'aries_popup_cred_exchange_id': newest_cred_exchange.credential_exchange_id });
        document.querySelector('#msg').innerHTML = JSON.stringify(newest_cred_exchange);

    });
}

async function acceptCredential() {
    // chrome.storage.local.get(['aries_popup_cred_exchange_id', 'aries_endpoint', 'tab_id'], function (storageData) {
    await $.post(window.aries_endpoint + '/credential_exchange/' + window.aries_popup_cred_exchange_id + '/send-request')
    responseGet = await $.get(window.aries_endpoint + '/credential_exchange/' + window.aries_popup_cred_exchange_id)
    while (responseGet.state != "credential_received") {
        await sleep(1000);
        responseGet = await $.get(window.aries_endpoint + '/credential_exchange/' + window.aries_popup_cred_exchange_id)
    }
    await $.post(window.aries_endpoint + '/credential_exchange/' + window.aries_popup_cred_exchange_id + '/store',
    function (data, status, jqXHR) {
        console.log('Stored credential. Response:', data);
    });
    self.close();
    // });
}

function rejectCredential() {
    self.close();
}

$(document).ready(function () {
    displayCredential();
    $('#aries_accept').click(acceptCredential);
    $('#aries_reject').click(rejectCredential);
});

function sortByDate(a, b) {
    return new Date(b.updated_at) - new Date(a.updated_at);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
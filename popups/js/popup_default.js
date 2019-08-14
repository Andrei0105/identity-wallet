function getConnections() {
    chrome.storage.local.get(['aries_endpoint'], function (storageData) {
        $.get(storageData.aries_endpoint + '/connections',
            function (data, status, jqXHR) {
                connections = data.results;
                connections.forEach(function (connection) {
                    $('#connections_table > tbody:last-child').append('<tr align="center">\
                    <td class="align-middle">' + connection.connection_id + '</td>\
                    <td class="align-middle">' + connection.state + '</td>\
                    <td class="align-middle"><button class="btn btn-primary val" data-connection_id="'+ connection.connection_id + '" type="button">Remove</button></td>\
                    </tr>');
                });
                $('.val').click(removeConnectionCb);
            });
    });
}

function getCredentialExchanges() {
    chrome.storage.local.get(['aries_endpoint'], function (storageData) {
        $.get(storageData.aries_endpoint + '/credential_exchange',
            function (data, status, jqXHR) {
                cred_exs = data.results;
                cred_exs.forEach(function (cred_ex) {
                    $('#credential_exchanges_table > tbody:last-child').append('<tr align="center">\
                    <td class="align-middle">' + cred_ex.credential_exchange_id + '</td>\
                    <td class="align-middle">' + cred_ex.state + '</td>\
                    <td class="align-middle"><button class="btn btn-primary val" data-credential_exchange_id="'+ cred_ex.credential_exchange_id + '" type="button">Remove</button></td>\
                    </tr>');
                });
                $('.val').click(removeCredentialExchangeCb);
            });
    });
}

function getCredentials() {
    chrome.storage.local.get(['aries_endpoint'], function (storageData) {
        $.get(storageData.aries_endpoint + '/credentials',
            function (data, status, jqXHR) {
                credentials = data.results;
                credentials.forEach(function (credential) {
                    $('#credentials_table > tbody:last-child').append('<tr align="center">\
                    <td class="align-middle">' + credential.referent + '</td>\
                    <td class="align-middle">' + JSON.stringify(credential.attrs) + '</td>\
                    <td class="align-middle"><button class="btn btn-primary val" data-credential_id="'+ credential.referent + '" type="button">Remove</button></td>\
                    </tr>');
                });
                $('.val').click(removeCredentialCb);
            });
    });
}

function removeConnectionCb() {
    button = $(this);
    connection_id = $(this).data('connection_id');
    chrome.storage.local.get(['aries_endpoint'], function (storageData) {
        $.post(storageData.aries_endpoint + '/connections/' + connection_id + '/remove',
            function (postData, status, jqXHR) {
                button.closest("tr").remove();
            });
    });
}

function removeCredentialExchangeCb() {
    button = $(this);
    credential_exchange_id = $(this).data('credential_exchange_id');
    chrome.storage.local.get(['aries_endpoint'], function (storageData) {
        $.post(storageData.aries_endpoint + '/credential_exchange/' + credential_exchange_id + '/remove',
            function (postData, status, jqXHR) {
                button.closest("tr").remove();
            });
    });
}

function removeCredentialCb() {
    button = $(this);
    credential_id = $(this).data('credential_id');
    chrome.storage.local.get(['aries_endpoint'], function (storageData) {
        $.post(storageData.aries_endpoint + '/credential/' + credential_id + '/remove',
            function (postData, status, jqXHR) {
                button.closest("tr").remove();
            });
    });
}

$(document).ready(function () {
    $('.menu-table th.clickable').click(function () {
        switch ($(this).text()) {
            case 'Connections':
                {
                    console.log('Clicked Connections');
                    $('#connections_table').removeClass('d-none');
                    $('#credential_exchanges_table').addClass('d-none');
                    $('#credentials_table').addClass('d-none');
                    break;
                }
            case 'Credential exchanges':
                {
                    console.log('Clicked Credential exchanges');
                    $('#connections_table').addClass('d-none');
                    $('#credential_exchanges_table').removeClass('d-none');
                    $('#credentials_table').addClass('d-none');
                    break;
                }
            case 'Credentials':
                {
                    console.log('Clicked Credentials');
                    $('#connections_table').addClass('d-none');
                    $('#credential_exchanges_table').addClass('d-none');
                    $('#credentials_table').removeClass('d-none');
                    break;
                }
        }
    });
    getConnections();
    getCredentialExchanges();
    getCredentials();
});
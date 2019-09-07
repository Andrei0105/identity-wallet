function getConnections() {
    chrome.storage.local.get(['aries_endpoint'], function (storageData) {
        $.get(storageData.aries_endpoint + '/connections',
            function (data, status, jqXHR) {
                connections = data.results;
                connections.forEach(function (connection) {
                    $('#connections_table > tbody:last-child').append('<tr class="clickable" data-toggle="collapse" data-target="#c-' + connection.connection_id + '" aria-expanded="true" aria-controls="c-' + connection.connection_id + '" align="center">\
                    <td class="align-middle">' + padShortenString(7, connection.connection_id) + '</td>\
                    <td class="align-middle">' + connection.state + '</td>\
                    <td class="align-middle"><button class="btn btn-primary val" data-connection_id="'+ connection.connection_id + '" type="button">Remove</button></td>\
                    </tr>\
                    <tr id="c-' + connection.connection_id + '" class="collapse">\
                    <td colspan="100">Connection ID:<br>' + connection.connection_id + 
                    '<br> State:<br>' + connection.state + 
                    '<br> Created at:<br>' + connection.created_at + 
                    '<br> Their label:<br>' + connection.their_label + 
                    '<br> Their DID:<br>' + connection.their_did + 
                    '<br> My DID:<br>' + connection.my_did + 
                    '</td>\
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
                    $('#credential_exchanges_table > tbody:last-child').append('<tr class="clickable" data-toggle="collapse" data-target="#c-' + cred_ex.credential_exchange_id + '" aria-expanded="true" aria-controls="c-' + cred_ex.credential_exchange_id + '" align="center">\
                    <td class="align-middle">' + padShortenString(7, cred_ex.credential_exchange_id) + '</td>\
                    <td class="align-middle">' + padShortenString(14, cred_ex.state) + '</td>\
                    <td class="align-middle"><button class="btn btn-primary val" data-credential_exchange_id="'+ cred_ex.credential_exchange_id + '" type="button">Remove</button></td>\
                    </tr>\
                    <tr id="c-' + cred_ex.credential_exchange_id + '" class="collapse">\
                    <td colspan="100">Credential exchange ID:<br>' + cred_ex.credential_exchange_id + 
                    '<br> State:<br>' + cred_ex.state + 
                    '<br> Connection ID:<br>' + cred_ex.connection_id + '</td>\
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
                    attrs_for_display = '';
                    attrs_for_display_collapse = '<ul>'
                    for (attribute in credential.attrs) {
                        attr_for_display = attribute + ': ' + credential.attrs[attribute];
                        attrs_for_display += padShortenString(14, attr_for_display) + '<br/>'
                        if (Object.keys(credential.attrs).length > 2) {
                            attrs_for_display += '...';
                            break;
                        }
                    }
                    for (attribute in credential.attrs) {
                        attr_for_display = '<li>' + attribute + ': ' + credential.attrs[attribute] + '</li>';
                        attrs_for_display_collapse += attr_for_display
                    }
                    attrs_for_display_collapse += '</ul>'
                    $('#credentials_table > tbody:last-child').append('<tr class="clickable" data-toggle="collapse" data-target="#c-' + credential.referent + '" aria-expanded="true" aria-controls="c-' + credential.referent + '" align="center">\
                    <td class="align-middle">' + padShortenString(7, credential.referent) + '</td>\
                    <td class="align-middle">' + attrs_for_display + '</td>\
                    <td class="align-middle"><button class="btn btn-primary val" data-credential_id="'+ credential.referent + '" type="button">Remove</button></td>\
                    </tr>\
                    <tr id="c-' + credential.referent + '" class="collapse">\
                    <td colspan="100">Credential ID:<br>' + credential.referent + '<br> Attributes:<br>' + attrs_for_display_collapse + '</td>\
                    </tr>');
                });
                $('.val').click(removeCredentialCb);
            });
    });
}

function removeConnectionCb(e) {
    e.preventDefault();
    e.stopPropagation();
    button = $(this);
    connection_id = $(this).data('connection_id');
    chrome.storage.local.get(['aries_endpoint'], function (storageData) {
        $.post(storageData.aries_endpoint + '/connections/' + connection_id + '/remove',
            function (postData, status, jqXHR) {
                button.closest("tr").remove();
                $('#c-' + connection_id).remove();
            });
    });
}

function removeCredentialExchangeCb(e) {
    e.preventDefault();
    e.stopPropagation();
    button = $(this);
    credential_exchange_id = $(this).data('credential_exchange_id');
    chrome.storage.local.get(['aries_endpoint'], function (storageData) {
        $.post(storageData.aries_endpoint + '/credential_exchange/' + credential_exchange_id + '/remove',
            function (postData, status, jqXHR) {
                button.closest("tr").remove();
                $('#c-' + credential_exchange_id).remove();
            });
    });
}

function removeCredentialCb(e) {
    e.preventDefault();
    e.stopPropagation();
    button = $(this);
    credential_id = $(this).data('credential_id');
    chrome.storage.local.get(['aries_endpoint'], function (storageData) {
        $.post(storageData.aries_endpoint + '/credential/' + credential_id + '/remove',
            function (postData, status, jqXHR) {
                button.closest("tr").remove();
                $('#c-' + credential_id).remove();
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

function padShortenString(length, str) {
    if (str.length > length)
        str = str.substring(0, length + 1) + '...';
    return str;
}
function getConnections() {
    chrome.storage.local.get(['aries_endpoint'], function (storageData) {
        $.get(storageData.aries_endpoint + '/connections',
            function (data, status, jqXHR) {
                connections = data.results;
                connections.forEach(function (connection) {
                    $('#connections_table > tbody:last-child').append('<tr align="center">\
                    <td>' + connection.connection_id + '</td>\
                    <td>' + connection.state + '</td>\
                    <td><button class="btn btn-primary val" data-connection_id="'+ connection.connection_id + '" type="button">Remove</button></td>\
                    </tr>');
                });
                $('.val').click(removeCb);
            });
    });
}

function removeCb() {
    button = $(this);
    connection_id = $(this).data('connection_id');
    chrome.storage.local.get(['aries_endpoint'], function (storageData) {
        $.post(storageData.aries_endpoint + '/connections/' + connection_id + '/remove',
            function (postData, status, jqXHR) {
                button.closest("tr").remove();
                // $.get(storageData.aries_endpoint + '/connections/' + connection_id,
                //     function (getData, status, jqXHR) {
                //         console.log(getData);
                //     });
            });
    });
}

$(document).ready(function () {
    getConnections();
});
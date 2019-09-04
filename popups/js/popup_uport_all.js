function displayQrCode() {
    chrome.storage.local.get(['uport_qr', 'uport_qr_type', 'tab_id'], function (data) {
        qr_code = data.uport_qr;
        qr_type = data.uport_qr_type;
        if (qr_type) {
            message = ''
            switch (qr_type) {
                case 'request':
                    message = 'You are receiving a request to share uPort credentials.'
                    break;
                case 'issue':
                    message = 'You are receiving a uPort credential.'
                    break;
                case 'transaction':
                    message = 'You are receiving a request to sign a Ethereum transaction.'
                    break;
            }
            $('#info-received').html(message);
        }
        console.log('P:', 'Read QR code from storage: ', qr_code);
        show_image(qr_code, 275, 275, 'qr-code');
    });
}

function show_image(src, width, height, id, alt) {
    var img = document.createElement("img");
    img.src = src;
    img.width = width;
    img.height = height;
    img.alt = alt;
    img.id = id;
    $('#center-div').html('');
    $('#center-div').width(275);
    $('#center-div').height(275);
    $('#center-div').append(img);
    $('#info-div').removeClass('d-none');
}

$(document).ready(function () {
    displayQrCode();
    window.onbeforeunload = function () {
        chrome.storage.local.remove(['uport_qr', 'uport_qr_type', 'tab_id']);
    }
});
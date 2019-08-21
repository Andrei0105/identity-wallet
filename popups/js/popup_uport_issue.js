function displayQrCode() {
    chrome.storage.local.get(['uport_issue_credetial_qr', 'tab_id'], function (data) {
        qr_code = data.uport_issue_credetial_qr;
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
});
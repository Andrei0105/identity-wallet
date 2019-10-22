function displayCurrentAgentEndpoint() {
    chrome.storage.local.get(['aries_endpoint', 'aries_http_endpoint'], function (storageData) {
        document.querySelector('#current_agent').innerHTML = "Current Agent management endpoint is: " + storageData.aries_endpoint + 
        "<br>Current Agent HTTP endpoint is: " + storageData.aries_http_endpoint
    });
}


function saveAgentEndpoint() {
    endpoint = $('#agent_endpoint').val()
    http_endpoint = $('#agent_http_endpoint').val()
    api_key = $('#agent_endpoint_api_key').val()
    console.log(endpoint, api_key)
    chrome.storage.local.set({ 'aries_http_endpoint': http_endpoint });
    chrome.storage.local.set({ 'aries_endpoint': endpoint });
    chrome.storage.local.set({ 'aries_api_key': api_key });
    displayCurrentAgentEndpoint();
}

$(document).ready(function () {
    $('#save_agent').click(saveAgentEndpoint);
    displayCurrentAgentEndpoint();
});
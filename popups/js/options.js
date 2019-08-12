function saveAgentEndpoint() {
    endpoint = $('#agent_endpoint').val()
    api_key = $('#agent_endpoint_api_key').val()
    console.log(endpoint, api_key)
    chrome.storage.local.set({ 'aries_endpoint': endpoint });
    chrome.storage.local.set({ 'aries_api_key': api_key });
}

$(document).ready(function () {
    $('#save_agent').click(saveAgentEndpoint);
});
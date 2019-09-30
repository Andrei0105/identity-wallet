utils = {}

utils.checkConnection =
    async function checkConnection(aries_endpoint, connection_id) {
        try {
            response = await $.post(aries_endpoint + '/connections/' + connection_id + '/send-ping');
            if (response) {
                response = true;
            }
            else {
                response = false;
            }
        } catch (error) {
            response = false;
        }
        return response;
    }

utils.checkAgentAvailability =
async function checkAgentAvailability(aries_endpoint) {
    try {
        response = await $.get(aries_endpoint + '/status');
        if (response) {
            response = true;
        }
        else {
            response = false;
        }
    } catch (error) {
        response = false;
    }
    return response;
}
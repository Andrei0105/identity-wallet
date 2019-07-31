function useBlockstack() {
    if (typeof window.blockstack !== "undefined") {
        chrome.storage.local.get(['auth_req'], function (data) {
            auth_req = data.auth_req;
            document.getElementById('signin-button').addEventListener('click', function () {
                blockstack.redirectToSignInWithAuthRequest(auth_req);
                // console.log('R1', auth_req)
            });
        });
    }
}

setTimeout(useBlockstack, 500);
async function useBlockstack() {
    while (typeof window.blockstack === "undefined") {
        await sleep(50);
    };

    if (typeof window.blockstack !== "undefined") {
        chrome.storage.local.get(['auth_req'], function (data) {
            auth_req = data.auth_req;
            blockstack.redirectToSignInWithAuthRequest(auth_req);
        });
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

useBlockstack();
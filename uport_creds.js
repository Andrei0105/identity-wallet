function checkVariable() {
    if (typeof window.uportconnect !== "undefined") {
        getCreds();
    }
}

function getCreds() {
    const Connect = window.uportconnect;
    const uport = new Connect('MyDApp');
    console.log('done');

    //TO DO: hide the uport wrapper and get the JWT
    uport.requestDisclosure()

    uport.onResponse('disclosureReq').then(res => {
      const did = res.payload.did
      json = JSON.stringify(res.payload)
      console.log(json)
      document.querySelector('#msg').innerHTML = "Congratulations you are now <b>logged in</b>`.  Here is your DID identifier:  " + json
    })
}

setTimeout(checkVariable, 3000);

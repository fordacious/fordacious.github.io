function runweb3() {
    var eth = window.ethereum;
    if (!eth) { return; }

    eth.enable().then(function (e) {
        console.log("Wallet connected");
        console.log(e);

        // TODO point to mint contract
        params: [
        {
            from: '0xb60e8dd61c5d32be8058bb8eb970870f07233155',
            to: '0xd46e8dd67c5d32be8058bb8eb970870f07244567',
            value: '0x9184e72a', // 2441406250
            data:
              '0xd46e8dd67c5d32be8d46e8dd67c5d32be8058bb8eb970870f072445675058bb8eb970870f072445675',
            },
        ];

        // ethereum.request({
        //     method: 'eth_sendTransaction',
        //     params,
        // })
        // .then((result) => {
        //     // The result varies by by RPC method.
        //     // For example, this method will return a transaction hash hexadecimal string on success.
        // })
        // .catch((error) => {
        //     // If the request fails, the Promise will reject with an error.
        // });


    }).catch(function (e) {
        console.log("Wallet connection failed");
        console.log(e);
    });
}
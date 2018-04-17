var mnemonic = "smart help degree appear flash object odor tragic drastic spare live clerk"
var HDWalletProvider = require("truffle-hdwallet-provider");

module.exports = {
  //'*****MAKE SURE "from:" ACCOUNT IS ON THE RIGHT NETWORK AND HAS ENOUGH GAS TO DEPLOY THE CONTRACT'
  networks: {
    // development: {
    //   provider: function() {
    //     return new HDWalletProvider(mnemonic, "https://kovan.infura.io/Wq3Bynrr8b0CO6bO0YVG")		///*****HIDE API KEY AND MNEMINIC!!!
    //   },
    //   network_id: "*"
    //   // from: '0x8398e9D9651d2695D3622F9E1266E3901Ba3C1DD'
    //   // gas: 4712388
    // }
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*", // Match any network id 
      gas: 4712388
    }
  }
};

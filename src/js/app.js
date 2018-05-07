App = {
  web3Provider: null,
  contracts: {},
  deployAccount: "0x627306090abaB3A6e1400e9345bC60c78a8BEf57",    //NEEDS TO BE CHANGED TO TERESAS ADDRESS
  masterAccount: "0xf17f52151EbEF6C7334FAD080c5704D77216b732",
  thirdAccount: "0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef",
  fourthAccount: "0x821aEa9a577a9b44299B9c15c88cf3087F3b5544",
  deployPrivateKey: "c87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3",
  masterPrivateKey: "ae6ae8e5ccbfb04590405997ee2d52d2b330726137b875053c36d94e974d162f",

  // Get private stuff from my .env file
  // import {my_privkey, infura_api_key} from '../.env'
  my_privkey: '',

  init: function() {
    // Load pets.
    console.log("Remember to reset contract address after a new truffle migrate!")
    $.getJSON('../pets.json', function(data) {
      var petsRow = $('#petsRow');
      var petTemplate = $('#petTemplate');

      for (i = 0; i < data.length; i ++) {
        petTemplate.find('.panel-title').text(data[i].name);
        petTemplate.find('img').attr('src', data[i].picture);
        petTemplate.find('.pet-breed').text(data[i].breed);
        petTemplate.find('.pet-age').text(data[i].age);
        petTemplate.find('.pet-location').text(data[i].location);
        petTemplate.find('.btn-adopt').attr('data-id', data[i].id);

        petsRow.append(petTemplate.html());
      }
    });

    return App.initWeb3();
  },

  initWeb3: function() {
    
    // Is there an injected web3 instance?
    var infura_api_key = "Wq3Bynrr8b0CO6bO0YVG"
    console.log("initWeb3")
    // App.web3Provider = new Web3.providers.HttpProvider(`https://kovan.infura.io/` + infura_api_key);    
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
    } else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      // App.web3Provider = new Web3.providers.HttpProvider(`https://kovan.infura.io/` + infura_api_key);
    } 

    web3 = new Web3(App.web3Provider);   
    console.log(App.web3Provider)
    return App.initContract();
  },

  initContract: function() {

    $.getJSON('ChozunCoin.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var CoinArtifact = data;
      App.contracts.Coin = TruffleContract(CoinArtifact);
      App.contracts.Coin.setProvider(App.web3Provider); // Set the provider for our contract
      App.contracts.Coin.setNetwork(5777); 

    });
  
    $.getJSON('Crowdsale.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var CrowdsaleArtifact = data;
      App.contracts.Crowdsale = TruffleContract(CrowdsaleArtifact);
      App.contracts.Crowdsale.setProvider(App.web3Provider); // Set the provider for our contract
      App.contracts.Crowdsale.setNetwork(5777); 


    });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-adopt', App.callTransfer);
  },

  callTransferMetaMask: function(){

    App.contracts.Coin.deployed().then(function(instance) {
        CoinInstance = instance;
        console.log(CoinInstance)
        var transferAmount = 1; 
        return CoinInstance.transfer.getData(App.destAddress, transferAmount, {from: App.deployAccount});
        }).then(function(result) {
          console.log(result)  
          App.findBalance()
        }).catch(function(err) {
          console.log(err.message);
    });

  },

  TransferTokensToCrowdsale: function(){

    App.contracts.Coin.deployed().then(function(instance) {
        CoinInstance = instance;
        console.log(CoinInstance)
        var transferAmount = 50000000000000000000000000; 
        var count = web3.eth.getTransactionCount(App.deployAccount);
        console.log(count)
        //////////*****DANGER USING SYNCHRONOUS CALL HERE???
        // var privateKey = EthJS.Buffer.Buffer('269f30fb2e8cad8c03229f33875c8d38e1989df49a6824d680ea98974e38c695', 'hex');
        var privateKey = EthJS.Buffer.Buffer(App.deployPrivateKey, 'hex');    // Testrpc
        contractData = CoinInstance.contract.transfer.getData(App.contracts.Crowdsale.address, transferAmount, {from: App.deployAccount})
        // contractData = CoinInstance.contract.transfer.getData(App.secondAccount, transferAmount, {from: App.myAddress})
        var rawTransaction = {
            "nonce": web3.toHex(count),
            "gasPrice": "100",
            "gasLimit": "205",
            "to": App.contracts.Coin.address,
            "value": "0x0",
            "data": contractData,
            "chainId": 0x03
        };
        // console.log(privateKey)
        var tx = new EthJS.Tx(rawTransaction);
        tx.sign(privateKey)
        let serializedTx = tx.serialize().toString('hex')
        console.log('serializedTx:', serializedTx)
        web3.eth.sendRawTransaction('0x' + serializedTx.toString('hex'), function(err, hash) {
          if (!err){
              console.log("Transaction hash: " + hash);
              console.log("Waiting for transaction to be mined")
              web3.eth.getTransactionReceipt(hash, function(err, hash) {
                if (!err){
                  console.log("Transaction mined: " + hash)
                  console.log(hash)
                  App.findBalance();     
                }else
                  console.log(err)
              });
          }else{
              console.log(err);
          }
        });

        'To check if transaction is mined but fails see if gas consumed (getTransactionReceipt) == max gas sent (getTransaction) - note this is not proof just likely - when a transaction fails'
        'all sent gas is consumed. When its successfull unused gas is returned'
        'Errors that fail before being mined = sending more gas than in your account/sending to an invalid address'
        'for already deployed contract - just change address value in contract build?'
        'SETUP SO IF ERROR HAPPENS GET SENT EMAIL'

    });

  },

  readCrowdsale: function(){

    App.contracts.Crowdsale.deployed().then(function(instance) {
        CrowdsaleInstance = instance;
        // return CrowdsaleInstance.tokenBalance.call();
        // return CrowdsaleInstance.offChainTokens.call();   
        return CrowdsaleInstance.dollarRate.call();   
        // return CrowdsaleInstance.balanceOf.call(App.fourthAccount);
        // return CrowdsaleInstance.dollarRate.call();
        // return CrowdsaleInstance.contlength.call();
        // return CrowdsaleInstance.beneficiary.call();
        // return CrowdsaleInstance.paused.call();
        // return CrowdsaleInstance.tokenReward.transfer(App.secondAccount, 10000000, {from:App.myAddress});
        }).then(function(result) {
          console.log(result)  
        }).catch(function(err) {
          console.log(err.message);
    });

  },

  sendEther: function(){
    // var send = web3.eth.sendTransaction({from:App.masterAccount, to:App.contracts.Crowdsale.address, value:web3.toWei(1, "ether"), gas: 4712388});
    // var send = web3.eth.sendTransaction({from:App.thirdAccount, to:App.contracts.Crowdsale.address, value:web3.toWei(1, "ether"), gas: 4712388});
    var send = web3.eth.sendTransaction({from:App.fourthAccount, to:App.contracts.Crowdsale.address, value:web3.toWei(5, "ether"), gas: 4712388});
  },

  callWithdraw: function(){

    App.contracts.Crowdsale.deployed().then(function(instance) {
        CrowdsaleInstance = instance;
        console.log(CrowdsaleInstance)
        var count = web3.eth.getTransactionCount(App.masterAccount);
        console.log(count)
        //////////*****DANGER USING SYNCHRONOUS CALL HERE???
        var privateKey = EthJS.Buffer.Buffer(App.masterPrivateKey, 'hex');    // Testrpc
        contractData = CrowdsaleInstance.contract.safeWithdrawal.getData({from: App.masterAccount})
        var rawTransaction = {
            "nonce": web3.toHex(count),
            "gasPrice": "100",
            "gasLimit": "205",
            "to": App.contracts.Crowdsale.address,
            "value": "0x0",
            "data": contractData,
            "chainId": 0x03
        };
        // console.log(privateKey)
        var tx = new EthJS.Tx(rawTransaction);
        tx.sign(privateKey)
        let serializedTx = tx.serialize().toString('hex')
        console.log('serializedTx:', serializedTx)
        web3.eth.sendRawTransaction('0x' + serializedTx.toString('hex'), function(err, hash) {
          if (!err){
              console.log("Transaction hash: " + hash);
              console.log("Waiting for transaction to be mined")
              web3.eth.getTransactionReceipt(hash, function(err, hash) {
                if (!err){
                  console.log("Transaction mined: " + hash)
                  console.log(hash)
                }else
                  console.log(err)
              });
          }else{
              console.log(err);
          }
        });

        'To check if transaction is mined but fails see if gas consumed (getTransactionReceipt) == max gas sent (getTransaction) - note this is not proof just likely - when a transaction fails'
        'all sent gas is consumed. When its successfull unused gas is returned'
        'Errors that fail before being mined = sending more gas than in your account/sending to an invalid address'
        'for already deployed contract - just change address value in contract build?'
        'SETUP SO IF ERROR HAPPENS GET SENT EMAIL'

    });

  },

  callPause: function(){

    App.contracts.Crowdsale.deployed().then(function(instance) {
        CrowdsaleInstance = instance;
        console.log(CrowdsaleInstance)
        var count = web3.eth.getTransactionCount(App.masterAccount);
        console.log("Nonce: " + count)
        //////////*****DANGER USING SYNCHRONOUS CALL HERE???
        var privateKey = EthJS.Buffer.Buffer(App.masterPrivateKey, 'hex');    // Testrpc
        contractData = CrowdsaleInstance.contract.pause.getData({from: App.masterAccount})
        var rawTransaction = {
            "nonce": web3.toHex(count),
            "gasPrice": "100",
            "gasLimit": "205",
            "to": App.contracts.Crowdsale.address,
            "value": "0x0",
            "data": contractData,
            "chainId": 0x03
        };
        var tx = new EthJS.Tx(rawTransaction);
        tx.sign(privateKey)
        let serializedTx = tx.serialize().toString('hex')
        console.log('serializedTx:', serializedTx)
        web3.eth.sendRawTransaction('0x' + serializedTx.toString('hex'), function(err, hash) {
          if (!err){
              console.log("Transaction hash: " + hash);
              console.log("Waiting for transaction to be mined")
              web3.eth.getTransactionReceipt(hash, function(err, hash) {
                if (!err){
                  console.log("Transaction mined: " + hash)
                  console.log(hash)
                }else
                  console.log(err)
              });
          }else{
              console.log(err);
          }
        });
    });
  },

  callUnPause: function(){

    App.contracts.Crowdsale.deployed().then(function(instance) {
        CrowdsaleInstance = instance;
        console.log(CrowdsaleInstance)
        var count = web3.eth.getTransactionCount(App.masterAccount);
        console.log("Nonce: " + count)
        //////////*****DANGER USING SYNCHRONOUS CALL HERE???
        var privateKey = EthJS.Buffer.Buffer(App.masterPrivateKey, 'hex');    // Testrpc
        contractData = CrowdsaleInstance.contract.unPause.getData({from: App.masterAccount})
        var rawTransaction = {
            "nonce": web3.toHex(count),
            "gasPrice": "100",
            "gasLimit": "205",
            "to": App.contracts.Crowdsale.address,
            "value": "0x0",
            "data": contractData,
            "chainId": 0x03
        };
        var tx = new EthJS.Tx(rawTransaction);
        tx.sign(privateKey)
        let serializedTx = tx.serialize().toString('hex')
        console.log('serializedTx:', serializedTx)
        web3.eth.sendRawTransaction('0x' + serializedTx.toString('hex'), function(err, hash) {
          if (!err){
              console.log("Transaction hash: " + hash);
              console.log("Waiting for transaction to be mined")
              web3.eth.getTransactionReceipt(hash, function(err, hash) {
                if (!err){
                  console.log("Transaction mined: " + hash)
                  console.log(hash)
                }else
                  console.log(err)
              });
          }else{
              console.log(err);
          }
        });
    });
  },

  calltokenDistribute: function(){

    App.contracts.Crowdsale.deployed().then(function(instance) {
        CrowdsaleInstance = instance;
        var count = web3.eth.getTransactionCount(App.masterAccount);
        //////////*****DANGER USING SYNCHRONOUS CALL HERE???
        var privateKey = EthJS.Buffer.Buffer(App.masterPrivateKey, 'hex');    // Testrpc
        contractData = CrowdsaleInstance.contract.tokenPayout.getData({from: App.masterAccount})
        var rawTransaction = {
            "nonce": web3.toHex(count),
            "gasPrice": "100",
            "gasLimit": "205",
            "to": App.contracts.Crowdsale.address,
            "value": "0x0",
            "data": contractData,
            "chainId": 0x03
        };
        // console.log(privateKey)
        var tx = new EthJS.Tx(rawTransaction);
        tx.sign(privateKey)
        let serializedTx = tx.serialize().toString('hex')
        console.log('serializedTx:', serializedTx)
        web3.eth.sendRawTransaction('0x' + serializedTx.toString('hex'), function(err, hash) {
          if (!err){
              console.log("Transaction hash: " + hash);
              console.log("Waiting for transaction to be mined")
              web3.eth.getTransactionReceipt(hash, function(err, hash) {
                if (!err){
                  console.log("Transaction mined: " + hash)
                  console.log(hash)
                }else
                  console.log(err)
              });
          }else{
              console.log(err);
          }
        });

    });

  },

  updateExchangeRate: function(){

    App.contracts.Crowdsale.deployed().then(function(instance) {
        CrowdsaleInstance = instance;
        var count = web3.eth.getTransactionCount(App.masterAccount);
        //////////*****DANGER USING SYNCHRONOUS CALL HERE???
        var privateKey = EthJS.Buffer.Buffer(App.masterPrivateKey, 'hex');    // Testrpc
        contractData = CrowdsaleInstance.contract.updateDollarRate.getData(30000, {from: App.masterAccount})
        var rawTransaction = {
            "nonce": web3.toHex(count),
            "gasPrice": "100",
            "gasLimit": "205",
            "to": App.contracts.Crowdsale.address,
            "value": "0x0",
            "data": contractData,
            "chainId": 0x03
        };
        // console.log(privateKey)
        var tx = new EthJS.Tx(rawTransaction);
        tx.sign(privateKey)
        let serializedTx = tx.serialize().toString('hex')
        console.log('serializedTx:', serializedTx)
        web3.eth.sendRawTransaction('0x' + serializedTx.toString('hex'), function(err, hash) {
          if (!err){
              console.log("Transaction hash: " + hash);
              console.log("Waiting for transaction to be mined")
              web3.eth.getTransactionReceipt(hash, function(err, hash) {
                if (!err){
                  console.log("Transaction mined: " + hash)
                  console.log(hash)
                }else
                  console.log(err)
              });
          }else{
              console.log(err);
          }
        });

    });

  },

  updateOffChainTokens: function(){

    App.contracts.Crowdsale.deployed().then(function(instance) {
        CrowdsaleInstance = instance;
        var count = web3.eth.getTransactionCount(App.masterAccount);
        //////////*****DANGER USING SYNCHRONOUS CALL HERE???
        var privateKey = EthJS.Buffer.Buffer(App.masterPrivateKey, 'hex');    // Testrpc
        contractData = CrowdsaleInstance.contract.updateOffChainTokens.getData(-5000, {from: App.masterAccount})
        var rawTransaction = {
            "nonce": web3.toHex(count),
            "gasPrice": "100",
            "gasLimit": "205",
            "to": App.contracts.Crowdsale.address,
            "value": "0x0",
            "data": contractData,
            "chainId": 0x03
        };
        // console.log(privateKey)
        var tx = new EthJS.Tx(rawTransaction);
        tx.sign(privateKey)
        let serializedTx = tx.serialize().toString('hex')
        console.log('serializedTx:', serializedTx)
        web3.eth.sendRawTransaction('0x' + serializedTx.toString('hex'), function(err, hash) {
          if (!err){
              console.log("Transaction hash: " + hash);
              console.log("Waiting for transaction to be mined")
              web3.eth.getTransactionReceipt(hash, function(err, hash) {
                if (!err){
                  console.log("Transaction mined: " + hash)
                  console.log(hash)
                }else
                  console.log(err)
              });
          }else{
              console.log(err);
          }
        });

    });

  },


  findBalance: function(){

    console.log("balance")
    App.contracts.Coin.deployed().then(function(instance) {
        CoinInstance = instance;

        // return CoinInstance.balanceOf(App.deployAccount, {from: App.deployAccount});
        return CoinInstance.balanceOf(App.fourthAccount, {from: App.deployAccount});
        // return CoinInstance.balanceOf(App.contracts.Crowdsale.address, {from: App.deployAccount});
        }).then(function(result) {
          console.log(result)  
        }).catch(function(err) {
          console.log(err.message);
    });

  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});



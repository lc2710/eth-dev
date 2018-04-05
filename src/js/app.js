App = {
  web3Provider: null,
  contracts: {},
  myAddress: "0x8398e9D9651d2695D3622F9E1266E3901Ba3C1DD",    //NEEDS TO BE CHANGED TO TERESAS ADDRESS
  destAddress: "0x98EaCBa30A42B5Decd6A16cBa79AEBa8245F8C4c",
  // contractAddress: "0x0e813ed6859a1cdda3480a9727753b756ad63fb0",    //Network 3 - ropsten?
  contractAddress: "0x6294acb341c71aac36e88241394a4cc4a6a56613",    //Network 42 - kovan?
  // contractAddress: "0x345ca3e014aaf5dca488057592ee47305d9b3e10",    //Network 5777 - testrpc?

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
    App.web3Provider = new Web3.providers.HttpProvider(`https://kovan.infura.io/` + infura_api_key);    
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
    } else {
      // App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      App.web3Provider = new Web3.providers.HttpProvider(`https://kovan.infura.io/` + infura_api_key);
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
    });
  
    $.getJSON('Crowdsale.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var CrowdsaleArtifact = data;
      App.contracts.Crowdsale = TruffleContract(CrowdsaleArtifact);
      App.contracts.Crowdsale.setProvider(App.web3Provider); // Set the provider for our contract

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
        return CoinInstance.transfer.getData(App.destAddress, transferAmount, {from: App.myAddress});
        }).then(function(result) {
          console.log(result)  
          App.findBalance()
        }).catch(function(err) {
          console.log(err.message);
    });

  },

  callTransfer: function(){

    App.contracts.Coin.deployed().then(function(instance) {
        CoinInstance = instance;
        console.log(CoinInstance)
        var transferAmount = 1000; 
        var count = web3.eth.getTransactionCount(App.myAddress);
        console.log(count)
        //////////*****DANGER USING SYNCHRONOUS CALL HERE???
        var privateKey = EthJS.Buffer.Buffer('269f30fb2e8cad8c03229f33875c8d38e1989df49a6824d680ea98974e38c695', 'hex');

        contractData = CoinInstance.contract.transfer.getData(App.destAddress, transferAmount, {from: App.myAddress})
        var rawTransaction = {
            "nonce": web3.toHex(count),
            "gasPrice": "100",
            "gasLimit": "205",
            "to": App.contractAddress,
            "value": "0x0",
            "data": contractData,
            "chainId": 0x03
        };

        console.log("privKey")
        console.log(privateKey)
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
                  console.log(web3.eth.getTransaction(web3.eth.getBlock("pending").transactions[0]))  //view pending transactions
                  App.findBalance();
                }else
                  console.log(err)
              });
          }else{
              console.log(err);
          }
        });
// Transaction succeeded but token didnt send => sending transaction from wrong account


        'To check if transaction is mined but fails see if gas consumed (getTransactionReceipt) == max gas sent (getTransaction) - note this is not proof just likely - when a transaction fails'
        'all sent gas is consumed. When its successfull unused gas is returned'

        'Errors that fail before being mined = sending more gas than in your account/sending to an invalid address'


    });

  },

  findBalance: function(){

    console.log("balance")
    App.contracts.Coin.deployed().then(function(instance) {
        CoinInstance = instance;
        return CoinInstance.balanceOf(App.destAddress, {from: App.myAddress});
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



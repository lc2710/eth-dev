App = {
  web3Provider: null,
  contracts: {},

  init: function() {
    // Load pets.
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
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
    } else {
      // If no injected web3 instance is detected, fall back to Ganache
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);

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
      console.log("hello")
      App.sendCrowdsaleTokens()


      // return App.sendCrowdsaleTokens();

    });

    return App.bindEvents();
  },

  sendCrowdsaleTokens: function() {

    App.contracts.Crowdsale.deployed().then(function(instance) {
      console.log(instance.address)
      crowdsale_address = instance.address
      App.contracts.Coin.deployed().then(function(instance) {
        CoinInstance = instance;
        return CoinInstance.balanceOf.call('0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef')
        // return CoinInstance.transfer(crowdsale_address, 5000000, {from: web3.eth.accounts[0]})
        // this isnt working as call does not change memory state!
        }).then(function(result) {
          console.log(result)  
          console.log(result.c)
          if (result.c[0] == 0) {
            console.log("transferring more you pig")
            return CoinInstance.transfer(crowdsale_address, 5000000, {from: web3.eth.accounts[0]
            }).then(function(result) {
            console.log(result)  
            }).catch(function(err) {
            console.log(err.message);
            });
          }
        }).catch(function(err) {
          console.log(err.message);
      });
    });

  },


  bindEvents: function() {
    // $(document).on('click', '.btn-adopt', App.balanceOf);
    // $(document).on('click', '.btn-adopt', App.amountRaised);
    $(document).on('click', '.btn-adopt', App.balanceOf);
  },

  amountRaised: function(event) {
    event.preventDefault();

    console.log("amountRaised")
    App.contracts.Crowdsale.deployed().then(function(instance) {
      CrowdsaleInstance = instance;
      console.log(CrowdsaleInstance)
      var account = web3.eth.accounts[0];
      // return CrowdsaleInstance.methods.amountRaised().call();
      return CrowdsaleInstance.amountRaised.call();
      }).then(function(result) {
        console.log("A")  
        console.log(result)  
      }).catch(function(err) {
        console.log(err.message);
      });
  },

  balanceOf: function(event) {  
    event.preventDefault();

    var userId = parseInt($(event.target).data('id'));
    console.log("balanceOf")
    App.contracts.Coin.deployed().then(function(instance) {
      CoinInstance = instance;
      console.log(CoinInstance)
      var account = web3.eth.accounts[0];
      console.log(account);
      return CoinInstance.balanceOf.call(account, {from: account});
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

var ChozunCoin = artifacts.require("ChozunCoin");
var Crowdsale = artifacts.require("Crowdsale");

module.exports = function(deployer) {
  deployer.deploy(ChozunCoin);
  deployer.deploy(Crowdsale);
};
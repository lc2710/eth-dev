var ChozunCoin = artifacts.require("ChozunCoin");
var Crowdsale = artifacts.require("Crowdsale");

module.exports = function(deployer, network, accounts) {

    return deployer
        .then(() => {
            return deployer.deploy(ChozunCoin);
        })
        .then(() => {
            return deployer.deploy(
                Crowdsale,
                ChozunCoin.address
            );
        });
};
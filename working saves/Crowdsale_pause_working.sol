pragma solidity ^0.4.13;

import './ChozunCoin.sol';

interface token {
    function transfer(address receiver, uint amount);
    function balanceOf(address) returns (uint256);
}

contract Crowdsale {
    address public beneficiary;
    address master;
    uint public tokenBalance;
    uint public amountRaised;
    uint public deadline;
    uint dollarRate;
    uint start_time;
    uint price;
    token public tokenReward;
    mapping(address => uint256) public balanceOf;
    event FundTransfer(address backer, uint amount, bool isContribution);
    address[] public contributors;
    bool public paused;

    address public contlength;  // Remove


    modifier afterDeadline() { if (now >= deadline) _; }
    modifier beforeDeadline() { if (now <= deadline) _; }
    modifier isPaused() { if (paused == true) _; }
    modifier notPaused() { if (paused == false) _; }
    modifier isMaster() { if (msg.sender == master) _; }
    

    /**
     * Constrctor function
     *
     * Setup the owner
     */
    function Crowdsale(ChozunCoin _token) {
        tokenBalance = 5000000;  
       // beneficiary = 0xe418b86f4be88d5fc42bedab4b1e32591c0b8fe6;   //CHANGE
        beneficiary = 0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef;   //CHANGE
        start_time = now;
        deadline = start_time + 10 * 1 minutes;     //CHANGE
        dollarRate = 280;//CHANGE
        // tokenReward = token(0x345ca3e014aaf5dca488057592ee47305d9b3e10);  //chozun coin address    //CHANGE
        tokenReward = token(_token);  //chozun coin address   
        master =  0xf17f52151EbEF6C7334FAD080c5704D77216b732;
        paused = false;
    }

    /**
     * Fallback function
    **/

    function () payable beforeDeadline notPaused {

        uint amount = msg.value;
        amountRaised += amount;
        price = SafeMath.div(0.35 * 1 ether, dollarRate);
        if (amount >= 37.5 ether && amount < 83 ether) {price = SafeMath.div(SafeMath.mul(100, price), 110);}  
        if (amount >= 87.5 ether && amount < 166 ether) {price = SafeMath.div(SafeMath.mul(100, price), 115);} 
        if (amount >= 175 ether) {price = SafeMath.div(SafeMath.mul(100, price), 120);}
        tokenBalance = SafeMath.sub(tokenBalance, SafeMath.div(amount, price));
        if (tokenBalance < 0 ) { revert(); }
        // tokenReward.transfer(msg.sender, SafeMath.div(amount * 1 ether, price));
        // FundTransfer(msg.sender, amount, true);

        balanceOf[msg.sender] += amount;     // Stores ether amount
        // balanceOf[msg.sender] += SafeMath.div(msg.value * 1 ether, price);        // Stores token amount

        contributors.push(msg.sender);
        contlength = contributors[0]; // Remove after testing
        
    }

    function tokenPayout() afterDeadline isMaster {

      price = SafeMath.div(0.35 * 1 ether, dollarRate);
      for (uint i=0; i<contributors.length; i++) {  
          tokenReward.transfer(contributors[i], SafeMath.div(balanceOf[contributors[i]] * 1 ether, price));
          FundTransfer(contributors[i], balanceOf[contributors[i]], true);
      }
      tokenReward.transfer(beneficiary, tokenReward.balanceOf(this));
      tokenBalance = 0;

    }

    function safeWithdrawal() afterDeadline isMaster {

      if (beneficiary.send(amountRaised)) {
          FundTransfer(beneficiary, amountRaised, false);
      }
    }

    function pause() notPaused isMaster {
      paused = true;
    }

    function unPause() isPaused isMaster {
      paused = false;
    }

}



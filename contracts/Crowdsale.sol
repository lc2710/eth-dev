pragma solidity ^0.4.13;

import './ChozunCoin.sol';

interface token {
    function transfer(address receiver, uint amount);
    function balanceOf(address) returns (uint256);
}

contract Crowdsale {
    address public beneficiary;
    address master;
    address backendMaster;
    uint public tokenBalance;
    uint public amountRaised;
    uint public deadline;
    uint public dollarRate;
    int public offChainTokens;
    uint start_time;
    uint price;
    token public tokenReward;
    mapping(address => uint256) public balanceOf;
    event FundTransfer(address backer, uint amount, bool isContribution);
    address[] public contributors;
    bool public paused;


    /**
     * Constrctor function
     *
     * Setup the owner
     */
    function Crowdsale(ChozunCoin _token) {
        tokenBalance = 5000000 * 1 ether;  
        offChainTokens = 0;
       // beneficiary = 0xe418b86f4be88d5fc42bedab4b1e32591c0b8fe6;   //CHANGE
        beneficiary = 0x5dffcB745205962c70957cfa43f4CC045328a093;   //CHANGE
        master = 0x8398e9D9651d2695D3622F9E1266E3901Ba3C1DD;
        backendMaster = 0x8398e9D9651d2695D3622F9E1266E3901Ba3C1DD;
        start_time = now;
        deadline = start_time + 300 * 1 minutes;     //CHANGE
        dollarRate = 280;//CHANGE
        // tokenReward = token(0x345ca3e014aaf5dca488057592ee47305d9b3e10);  //chozun coin address    //CHANGE
        tokenReward = token(_token);  //chozun coin address   
        paused = false;
    }


    modifier afterDeadline() { if (now >= deadline) _; }
    modifier beforeDeadline() { if (now <= deadline) _; }
    modifier isPaused() { if (paused == true) _; }
    modifier notPaused() { if (paused == false) _; }
    modifier isMaster() { if (msg.sender == master) _; }
    modifier isBackendMaster() { if (msg.sender == backendMaster) _; }
    

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
        // THIS IS OLD VERSION WHEN INITIAK TOKEN BALANCE IS 5000000, used to try and get rid of no decimal problem. tokenBalance = SafeMath.sub(tokenBalance, SafeMath.div(amount, price)); 
        tokenBalance = SafeMath.sub(tokenBalance, SafeMath.div(amount * 1 ether, price));
        if (int(tokenBalance) - offChainTokens < 0 ) { revert(); }
        if (balanceOf[msg.sender] == 0) {
          contributors.push(msg.sender);
        }
        // balanceOf[msg.sender] += amount;     // Stores ether amount
        balanceOf[msg.sender] += SafeMath.div(msg.value * 1 ether, price);        // Stores token amount
        // balanceOf[msg.sender] += SafeMath.div(msg.value, price);        // Stores token amount
       
    }

    // function tokenPayout() afterDeadline isMaster {
    function tokenPayout() isMaster {

     for (uint i=0; i<contributors.length; i++) {  
          tokenReward.transfer(contributors[i], balanceOf[contributors[i]]);
          // FundTransfer(contributors[i], balanceOf[contributors[i]], true);
     }
      tokenReward.transfer(beneficiary, tokenReward.balanceOf(this));
      tokenBalance = 0;

    }

    // function safeWithdrawal() afterDeadline isMaster {
    function safeWithdrawal() isMaster {

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

    function updateDollarRate(uint _dollarRate) isBackendMaster {
         dollarRate = _dollarRate;
    }

    function updateOffChainTokens(int _offChainTokens) isBackendMaster {
        offChainTokens += _offChainTokens;
    }
}



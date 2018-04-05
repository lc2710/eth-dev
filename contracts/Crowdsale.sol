pragma solidity ^0.4.13;

library SafeMath {
  function mul(uint a, uint b) internal returns (uint) {
    uint c = a * b;
    assert(a == 0 || c / a == b);
    return c;
  }

  function div(uint a, uint b) internal returns (uint) {
    // assert(b > 0); // Solidity automatically throws when dividing by 0
    uint c = a / b;
    // assert(a == b * c + a % b); // There is no case in which this doesn't hold
    return c;
  }

  function sub(uint a, uint b) internal returns (uint) {
    assert(b <= a);
    return a - b;
  }

  function add(uint a, uint b) internal returns (uint) {
    uint c = a + b;
    assert(c >= a);
    return c;
  }

  function max64(uint64 a, uint64 b) internal constant returns (uint64) {
    return a >= b ? a : b;
  }

  function min64(uint64 a, uint64 b) internal constant returns (uint64) {
    return a < b ? a : b;
  }

  function max256(uint256 a, uint256 b) internal constant returns (uint256) {
    return a >= b ? a : b;
  }

  function min256(uint256 a, uint256 b) internal constant returns (uint256) {
    return a < b ? a : b;
  }
}

interface token {
    function transfer(address receiver, uint amount);
    function balanceOf(address) returns (uint256);
}

contract Crowdsale {
    address public beneficiary;
    uint public tokenBalance;
    uint public amountRaised;
    uint public deadline;
    uint dollar_exchange;
    uint test_factor;
    uint start_time;
    uint price;
    token public tokenReward;
    mapping(address => uint256) public balanceOf;
    event FundTransfer(address backer, uint amount, bool isContribution);

    /**
     * Constrctor function
     *
     * Setup the owner
     */
    function Crowdsale() {
        tokenBalance = 5000000;  
        beneficiary = 0xE418b86F4Be88D5fC42bEdaB4B1E32591c0B8fE6;   //CHANGE
        start_time = now;
        deadline = start_time + 15 * 1 minutes;     //CHANGE
        dollar_exchange = 280;//CHANGE
        tokenReward = token(0xDbfacBE6F911196a9E7EC5A22a8a64B43831423F);  //chozun coin address    //CHANGE
    }

    /**
     * Fallback function
    **/

    function () payable beforeDeadline {

        uint amount = msg.value;
        balanceOf[msg.sender] += amount;
        amountRaised += amount;
        test_factor = 10000;    //CHANGE
        price = SafeMath.div(0.35 * 1 ether, dollar_exchange);
        if (amount >= 37.5 ether /test_factor && amount < 83 ether /test_factor) {price = SafeMath.div(SafeMath.mul(100, price), 110);}  //CHANGE - remove test factor
        if (amount >= 87.5 ether /test_factor && amount < 166 ether /test_factor) {price = SafeMath.div(SafeMath.mul(100, price), 115);}  //CHANGE - remove test factor
        if (amount >= 175 ether /test_factor) {price = SafeMath.div(SafeMath.mul(100, price), 120);}//CHANGE - remove test factor
        price = SafeMath.div(price, test_factor); // for testing    //CHANGE - remove test factor
        tokenBalance = SafeMath.sub(tokenBalance, SafeMath.div(amount, price));
        if (tokenBalance < 0 ) { revert(); }
        tokenReward.transfer(msg.sender, SafeMath.div(amount * 1 ether, price));
        FundTransfer(msg.sender, amount, true);
        
    }

    modifier afterDeadline() { if (now >= deadline) _; }
    modifier beforeDeadline() { if (now <= deadline) _; }

    function safeWithdrawal() afterDeadline {

        if (beneficiary.send(amountRaised)) {
            FundTransfer(beneficiary, amountRaised, false);
            tokenReward.transfer(beneficiary, tokenReward.balanceOf(this));
            tokenBalance = 0;
        }
    }
}



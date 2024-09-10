//Deployed on fhenix  0x72307c0AA4319792AE78f8b12Dc730ECfADf450e
//Deployed on sepolia  0xe64048ade7adc9512c880f622b50F2D9e99af3aa
//Depoloyed on rootstock 0x72307c0AA4319792AE78f8b12Dc730ECfADf450e

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract RohrToken is ERC20{
    struct Minter{
        address minter;
        uint256 timeLastMinted;
    }
    mapping(address => Minter) public minters;
    uint public mintingTime = 10 minutes;

    constructor() ERC20("Rohr Tokens", "RTK"){
    }

    function mint() external{
        require(minters[msg.sender].timeLastMinted < block.timestamp - mintingTime, 'Minting time not passed');
         minters[msg.sender].timeLastMinted = block.timestamp;
        _mint(msg.sender, 1000e18);
    }
}
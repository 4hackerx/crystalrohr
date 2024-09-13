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
    event Minted(bool successful);
    uint256 _totalSupply = totalSupply();
    constructor() ERC20("Rohr Tokens", "RTK"){
    }

    function mint() external{
        require(minters[msg.sender].timeLastMinted < block.timestamp - mintingTime, 'Minting time not passed');
         minters[msg.sender].timeLastMinted = block.timestamp;
        _mint(msg.sender, 1000e18);
        emit Minted(true); 
    }
}
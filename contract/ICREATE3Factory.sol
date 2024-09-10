// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ICREATE3Factory {
    function deploy(bytes32 salt, bytes memory creationCode) external payable returns (address deployed);
}
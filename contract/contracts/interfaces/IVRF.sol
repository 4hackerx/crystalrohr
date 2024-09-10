// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IVRF{
    function requestRandomWords(uint32 numWords) external returns (uint256 requestId);
    function getRandomWords(uint256 requestId) external view returns (uint256[] memory);
    function getRequestStatus(uint256 _requestId) external view returns (bool fulfilled, uint256[] memory randomWords);
}
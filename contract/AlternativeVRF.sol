// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./interfaces/IVRF.sol";

contract AlternativeVRF is IVRF {
    mapping(uint256 => uint256[]) private s_requests;
    mapping(uint256 => bool) private s_requestFulfilled;
    uint256 private nonce;

    event RequestSent(uint256 requestId, uint32 numWords);
    event RequestFulfilled(uint256 requestId, uint256[] randomWords);

    function requestRandomWords(uint32 numWords) external override  returns (uint256 requestId) {
        requestId = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, nonce++)));
        uint256[] memory randomWords = new uint256[](numWords);
        for (uint32 i = 0; i < numWords; i++) {
            randomWords[i] = uint256(keccak256(abi.encodePacked(blockhash(block.number - 1), requestId, i)));
        }
        s_requests[requestId] = randomWords;
        s_requestFulfilled[requestId] = true;
        emit RequestSent(requestId, numWords);
        emit RequestFulfilled(requestId, randomWords);
        return requestId;
    }

    function getRandomWords(uint256 requestId) external view override returns (uint256[] memory) {
        require(s_requestFulfilled[requestId], "Request not fulfilled");
        return s_requests[requestId];
    }

    function getRequestStatus(uint256 _requestId) external view override returns (bool fulfilled, uint256[] memory randomWords) {
        require(s_requests[_requestId].length > 0, "Request not found");
        fulfilled = s_requestFulfilled[_requestId];
        randomWords = s_requests[_requestId];
        return (fulfilled, randomWords);
    }
}
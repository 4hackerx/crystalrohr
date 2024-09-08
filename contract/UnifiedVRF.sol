    // SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IVRF.sol";

contract UnifiedVRF is VRFConsumerBaseV2,IVRF{
    VRFCoordinatorV2Interface private COORDINATOR;
    
    uint64 private s_subscriptionId;
    bytes32 private s_keyHash;
    uint32 private s_callbackGasLimit;
    uint16 private s_requestConfirmations;
    
    mapping(uint256 => uint256[]) private s_requests;
    mapping(uint256 => bool) private s_requestFulfilled;
    uint256 private nonce;
    
    bool public useChainlink;
    
    event RequestSent(uint256 requestId, uint32 numWords);
    event RequestFulfilled(uint256 requestId, uint256[] randomWords);

    constructor(
        bool _useChainlink,
        address _vrfCoordinator,
        uint64 _subscriptionId,
        bytes32 _keyHash,
        uint32 _callbackGasLimit,
        uint16 _requestConfirmations
    ) VRFConsumerBaseV2(_vrfCoordinator) {
        useChainlink = _useChainlink;
        
        if (useChainlink) {
            COORDINATOR = VRFCoordinatorV2Interface(_vrfCoordinator);
            s_subscriptionId = _subscriptionId;
            s_keyHash = _keyHash;
            s_callbackGasLimit = _callbackGasLimit;
            s_requestConfirmations = _requestConfirmations;
        }
    }

    function requestRandomWords(uint32 numWords) external returns (uint256 requestId) {
        if (useChainlink) {
            requestId = COORDINATOR.requestRandomWords(
                s_keyHash,
                s_subscriptionId,
                s_requestConfirmations,
                s_callbackGasLimit,
                numWords
            );
            s_requests[requestId] = new uint256[](0);
            s_requestFulfilled[requestId] = false;
        } else {
            requestId = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, nonce++)));
            uint256[] memory randomWords = new uint256[](numWords);
            for (uint32 i = 0; i < numWords; i++) {
                randomWords[i] = uint256(keccak256(abi.encodePacked(blockhash(block.number - 1), requestId, i)));
            }
            s_requests[requestId] = randomWords;
            s_requestFulfilled[requestId] = true;
            emit RequestFulfilled(requestId, randomWords);
        }
        
        emit RequestSent(requestId, numWords);
        return requestId;
    }

    function fulfillRandomWords(uint256 _requestId, uint256[] memory _randomWords) internal override {
        require(useChainlink, "Chainlink VRF is not enabled");
        require(!s_requestFulfilled[_requestId], "Request already fulfilled");
        s_requests[_requestId] = _randomWords;
        s_requestFulfilled[_requestId] = true;
        emit RequestFulfilled(_requestId, _randomWords);
    }

    function getRandomWords(uint256 requestId) external view returns (uint256[] memory) {
        require(s_requestFulfilled[requestId], "Request not fulfilled");
        return s_requests[requestId];
    }

    function getRequestStatus(uint256 _requestId) external view returns (bool fulfilled, uint256[] memory randomWords) {
        require(s_requests[_requestId].length > 0 || !s_requestFulfilled[_requestId], "Request not found");
        fulfilled = s_requestFulfilled[_requestId];
        randomWords = s_requests[_requestId];
        return (fulfilled, randomWords);
    }
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/IVRF.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";

contract ChainlinkVRF is IVRF, VRFConsumerBaseV2 {
    VRFCoordinatorV2Interface private immutable COORDINATOR;

    uint64 private immutable s_subscriptionId;
    bytes32 private immutable s_keyHash;
    uint32 private immutable s_callbackGasLimit;
    uint16 private immutable s_requestConfirmations;

    mapping(uint256 => uint256[]) private s_requests;
    mapping(uint256 => bool) private s_requestFulfilled;

    event RequestSent(uint256 requestId, uint32 numWords);
    event RequestFulfilled(uint256 requestId, uint256[] randomWords);

    constructor(
        address vrfCoordinator,
        uint64 subscriptionId,
        bytes32 keyHash,
        uint32 callbackGasLimit,
        uint16 requestConfirmations
    ) VRFConsumerBaseV2(vrfCoordinator) {
        COORDINATOR = VRFCoordinatorV2Interface(vrfCoordinator);
        s_subscriptionId = subscriptionId;
        s_keyHash = keyHash;
        s_callbackGasLimit = callbackGasLimit;
        s_requestConfirmations = requestConfirmations;
    }

    function requestRandomWords(uint32 numWords) external override  returns (uint256 requestId) {
        requestId = COORDINATOR.requestRandomWords(
            s_keyHash,
            s_subscriptionId,
            s_requestConfirmations,
            s_callbackGasLimit,
            numWords
        );
        s_requests[requestId] = new uint256[](0);
        s_requestFulfilled[requestId] = false;
        emit RequestSent(requestId, numWords);
        return requestId;
    }

    function fulfillRandomWords(uint256 _requestId, uint256[] memory _randomWords) internal override {
        require(!s_requestFulfilled[_requestId], "Request already fulfilled");
        s_requests[_requestId] = _randomWords;
        s_requestFulfilled[_requestId] = true;
        emit RequestFulfilled(_requestId, _randomWords);
    }

    function getRandomWords(uint256 requestId) external view override returns (uint256[] memory) {
        require(s_requestFulfilled[requestId], "Request not fulfilled");
        return s_requests[requestId];
    }

    function getRequestStatus(uint256 _requestId) external view override returns (bool fulfilled, uint256[] memory randomWords) {
        require(s_requests[_requestId].length > 0 || !s_requestFulfilled[_requestId], "Request not found");
        fulfilled = s_requestFulfilled[_requestId];
        randomWords = s_requests[_requestId];
        return (fulfilled, randomWords);
    }
}



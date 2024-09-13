// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import {VRFConsumerBaseV2Plus} from "@chainlink/contracts@1.2.0/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {IVRFCoordinatorV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/interfaces/IVRFCoordinatorV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts@1.2.0/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";
import "./interfaces/IVRF.sol";

contract UnifiedVRF is VRFConsumerBaseV2Plus ,IVRF{
    // VRFCoordinatorV2PlusInterface private COORDINATOR;
    
    uint256 private s_subscriptionId;
    bytes32 private s_keyHash;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;
    mapping(uint256 => uint256[]) private s_requests;
    mapping(uint256 => bool) private s_requestFulfilled;
    uint256 private nonce;
    uint256 public requestId;

    bool public useChainlink;
    
    event RequestSent(uint256 requestId, uint32 numWords);
    event RequestFulfilled(uint256 requestId, uint256[] randomWords);

    constructor(
        bool _useChainlink,
        address _vrfCoordinator,
        bytes32 _keyHash,
        uint256 _subscriptionId
    ) VRFConsumerBaseV2Plus(_vrfCoordinator) {
        useChainlink = _useChainlink;
        
        if (useChainlink) {
            s_subscriptionId = _subscriptionId;
            s_keyHash = _keyHash;
        }
    }

    function requestRandomWords(uint32 numWords) external returns (uint256) {
        if (useChainlink) {
            requestId = s_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: s_keyHash,
                subId: s_subscriptionId,
                requestConfirmations: REQUEST_CONFIRMATIONS,
                callbackGasLimit: 100000,
                numWords: NUM_WORDS,
                extraArgs: VRFV2PlusClient._argsToBytes(
                    VRFV2PlusClient.ExtraArgsV1({
                        nativePayment: true
                    })
                )
            })

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

    function fulfillRandomWords(uint256 _requestId, uint256[] calldata _randomWords) internal override {
        require(useChainlink, "Chainlink VRF is not enabled");
        require(!s_requestFulfilled[_requestId], "Request already fulfilled");
        s_requests[_requestId] = _randomWords;
        s_requestFulfilled[_requestId] = true;
        emit RequestFulfilled(_requestId, _randomWords);
    }

    function getRandomWords(uint256 _requestId) external view returns (uint256[] memory) {
        require(s_requestFulfilled[_requestId], "Request not fulfilled");
        return s_requests[_requestId];
    }

    function getRequestStatus(uint256 _requestId) external view returns (bool fulfilled, uint256[] memory randomWords) {
        require(s_requests[_requestId].length > 0 || !s_requestFulfilled[_requestId], "Request not found");
        fulfilled = s_requestFulfilled[_requestId];
        randomWords = s_requests[_requestId];
        return (fulfilled, randomWords);
    }
}
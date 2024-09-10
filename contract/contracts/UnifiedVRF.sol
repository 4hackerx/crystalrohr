//Deployed on Fhenix 0xDF933Cd647f69198D44cC0C6e982568534546f33
//Deployed on Sepolia 0xb89B642Fc1596dcc9b78D5A4ff49AB5740A1c6FD
//Deployed on Rootstock 0x67A0152B7ee4A577EeA0d1Ff2efe40007A93C039

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2PlusInterface.sol";
// import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {IVRFCoordinatorV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/interfaces/IVRFCoordinatorV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";
import "./interfaces/IVRF.sol";

contract UnifiedVRF is VRFConsumerBaseV2Plus ,IVRF{
    // VRFCoordinatorV2PlusInterface private COORDINATOR;
    
    uint256 private s_subscriptionId;
    bytes32 private s_keyHash;
    uint32 private s_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;
    mapping(uint256 => uint256[]) private s_requests;
    mapping(uint256 => bool) private s_requestFulfilled;
    uint256 private nonce;
    IVRFCoordinatorV2Plus private COORDINATOR;

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
            COORDINATOR = IVRFCoordinatorV2Plus(_vrfCoordinator);
            s_subscriptionId = _subscriptionId;
            s_keyHash = _keyHash;
        }
    }

    function requestRandomWords(uint32 numWords) external override returns  (uint256 requestId) {
        if (useChainlink) {
            requestId = s_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: s_keyHash,
                subId: s_subscriptionId,
                requestConfirmations: REQUEST_CONFIRMATIONS,
                callbackGasLimit: 2500000,
                numWords: NUM_WORDS,
                // Set nativePayment to true to pay for VRF requests with Sepolia ETH instead of LINK
                extraArgs: VRFV2PlusClient._argsToBytes(VRFV2PlusClient.ExtraArgsV1({nativePayment: false}))
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
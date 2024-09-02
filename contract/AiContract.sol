// SPDX-License-Identifier: MIT
//deployed address : 0x72307c0AA4319792AE78f8b12Dc730ECfADf450e

pragma solidity ^0.8.13;

import "./interfaces/IOracle.sol";

contract VideoCaptioningService {

    struct CaptioningJob {
        address owner;
        uint[] messageIds;
    }

    struct StoredMessage {
        string role;
        uint[] contentIds;
    }

    struct StoredContent {
        string contentType;
        string value;
    }

    mapping(uint => CaptioningJob) public captioningJobs;
    mapping(uint => StoredMessage) public storedMessages;
    mapping(uint => StoredContent) public storedContents;

    uint private jobCount;
    uint private messageCount;
    uint private contentCount;

    event CaptioningJobCreated(address indexed owner, uint indexed jobId);

    address private owner;
    address public oracleAddress;

    event OracleAddressUpdated(address indexed newOracleAddress);

    IOracle.OpenAiRequest private config;

    constructor(address initialOracleAddress) {
        owner = msg.sender;
        oracleAddress = initialOracleAddress;
        jobCount = 0;
        messageCount = 0;
        contentCount = 0;

        config = IOracle.OpenAiRequest({
            model: "gpt-4-vision-preview",
            frequencyPenalty: 21,
            logitBias: "",
            maxTokens: 1000,
            presencePenalty: 21,
            responseFormat: "{\"type\":\"text\"}",
            seed: 0,
            stop: "",
            temperature: 10,
            topP: 101,
            tools: "",
            toolChoice: "",
            user: ""
        });
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not owner");
        _;
    }

    modifier onlyOracle() {
        require(msg.sender == oracleAddress, "Caller is not oracle");
        _;
    }

    function setOracleAddress(address newOracleAddress) public onlyOwner {
        oracleAddress = newOracleAddress;
        emit OracleAddressUpdated(newOracleAddress);
    }

    function startCaption(string memory videoUrl, string[] memory imageUrls) public returns (uint) {
        uint currentJobId = jobCount++;
        CaptioningJob storage job = captioningJobs[currentJobId];
        job.owner = msg.sender;

        uint currentMessageId = messageCount++;
        StoredMessage storage newMessage = storedMessages[currentMessageId];
        newMessage.role = "user";

        // Store video URL content
        uint videoContentId = contentCount++;
        storedContents[videoContentId] = StoredContent("text", videoUrl);
        newMessage.contentIds.push(videoContentId);

        // Store image URLs content
        for (uint i = 0; i < imageUrls.length; i++) {
            uint imageContentId = contentCount++;
            storedContents[imageContentId] = StoredContent("image_url", imageUrls[i]);
            newMessage.contentIds.push(imageContentId);
        }

        job.messageIds.push(currentMessageId);

        IOracle(oracleAddress).createOpenAiLlmCall(currentJobId, config);
        emit CaptioningJobCreated(msg.sender, currentJobId);

        return currentJobId;
    }

    function onOracleCaptionResponse(
        uint jobId,
        IOracle.OpenAiResponse memory response,
        string memory errorMessage
    ) public onlyOracle {
        CaptioningJob storage job = captioningJobs[jobId];
        require(job.messageIds.length > 0, "No previous message");

        uint lastMessageId = job.messageIds[job.messageIds.length - 1];
        require(keccak256(abi.encodePacked(storedMessages[lastMessageId].role)) == keccak256(abi.encodePacked("user")), "Last message not from user");

        uint currentMessageId = messageCount++;
        StoredMessage storage newMessage = storedMessages[currentMessageId];
        newMessage.role = "assistant";

        uint contentId = contentCount++;
        storedContents[contentId] = StoredContent("text", compareStrings(errorMessage, "") ? response.content : errorMessage);
        newMessage.contentIds.push(contentId);

        job.messageIds.push(currentMessageId);
    }

    function addCaption(string memory caption, uint jobId) public {
        CaptioningJob storage job = captioningJobs[jobId];
        require(job.messageIds.length > 0, "No previous message");
        require(job.owner == msg.sender, "Only job owner can add captions");

        uint lastMessageId = job.messageIds[job.messageIds.length - 1];
        require(keccak256(abi.encodePacked(storedMessages[lastMessageId].role)) == keccak256(abi.encodePacked("assistant")), "No response to previous caption");

        uint currentMessageId = messageCount++;
        StoredMessage storage newMessage = storedMessages[currentMessageId];
        newMessage.role = "user";

        uint contentId = contentCount++;
        storedContents[contentId] = StoredContent("text", caption);
        newMessage.contentIds.push(contentId);

        job.messageIds.push(currentMessageId);

        IOracle(oracleAddress).createOpenAiLlmCall(jobId, config);
    }

    function getCaptionHistory(uint jobId) public view returns (IOracle.Message[] memory) {
        CaptioningJob storage job = captioningJobs[jobId];
        IOracle.Message[] memory messages = new IOracle.Message[](job.messageIds.length);

        for (uint i = 0; i < job.messageIds.length; i++) {
            StoredMessage storage storedMsg = storedMessages[job.messageIds[i]];
            IOracle.Content[] memory contents = new IOracle.Content[](storedMsg.contentIds.length);

            for (uint j = 0; j < storedMsg.contentIds.length; j++) {
                StoredContent storage storedContent = storedContents[storedMsg.contentIds[j]];
                contents[j] = IOracle.Content(storedContent.contentType, storedContent.value);
            }

            messages[i] = IOracle.Message(storedMsg.role, contents);
        }

        return messages;
    }

    function compareStrings(string memory a, string memory b) private pure returns (bool) {
        return (keccak256(abi.encodePacked((a))) == keccak256(abi.encodePacked((b))));
    }
}
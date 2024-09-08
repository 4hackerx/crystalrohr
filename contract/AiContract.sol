// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./interfaces/IOracle.sol";

contract OpenAiChatGptVision {
    struct Content {
        string contentType;
        string value;
    }

    struct Message {
        string role;
        Content[] content;
    }

    struct ChatRun {
        address owner;
        Message[] messages;
    }

    mapping(uint => ChatRun) public chatRuns;
    uint private chatRunsCount;

    event ChatCreated(address indexed owner, uint indexed chatId);

    address private owner;
    address public oracleAddress;

    event OracleAddressUpdated(address indexed newOracleAddress);

    IOracle.OpenAiRequest private config;

    constructor(address initialOracleAddress) {
        owner = msg.sender;
        oracleAddress = initialOracleAddress;
        chatRunsCount = 0;

        config = IOracle.OpenAiRequest({
            model: "gpt-4-turbo",
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

    function startChat(string memory message, string[] memory imageUrls) public returns (uint) {
        uint currentId = chatRunsCount;
        chatRunsCount++;

        ChatRun storage run = chatRuns[currentId];
        run.owner = msg.sender;

        Message storage newMessage = run.messages.push();
        newMessage.role = "user";

        Content storage textContent = newMessage.content.push();
        textContent.contentType = "text";
        textContent.value = message;

        for (uint u = 0; u < imageUrls.length; u++) {
            Content storage imageContent = newMessage.content.push();
            imageContent.contentType = "image_url";
            imageContent.value = imageUrls[u];
        }

        IOracle(oracleAddress).createOpenAiLlmCall(currentId, config);
        emit ChatCreated(msg.sender, currentId);

        return currentId;
    }

    function onOracleOpenAiLlmResponse(
        uint runId,
        IOracle.OpenAiResponse memory response,
        string memory errorMessage
    ) public onlyOracle {
        ChatRun storage run = chatRuns[runId];
        require(run.messages.length > 0 && keccak256(abi.encodePacked(run.messages[run.messages.length - 1].role)) == keccak256(abi.encodePacked("user")),
            "No message to respond to"
        );

        Message storage newMessage = run.messages.push();
        newMessage.role = "assistant";

        Content storage content = newMessage.content.push();
        content.contentType = "text";
        content.value = !compareStrings(errorMessage, "") ? errorMessage : response.content;
    }

    function addMessage(string memory message, uint runId) public {
        ChatRun storage run = chatRuns[runId];
        require(run.messages.length > 0 && keccak256(abi.encodePacked(run.messages[run.messages.length - 1].role)) == keccak256(abi.encodePacked("assistant")),
            "No response to previous message"
        );
        require(run.owner == msg.sender, "Only chat owner can add messages");

        Message storage newMessage = run.messages.push();
        newMessage.role = "user";

        Content storage content = newMessage.content.push();
        content.contentType = "text";
        content.value = message;

        IOracle(oracleAddress).createOpenAiLlmCall(runId, config);
    }

    function getMessageHistory(uint chatId) public view returns (Message[] memory) {
        return chatRuns[chatId].messages;
    }

    function compareStrings(string memory a, string memory b) private pure returns (bool) {
        return (keccak256(abi.encodePacked((a))) == keccak256(abi.encodePacked((b))));
    }
}
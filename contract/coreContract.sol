// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

//deployed address for sepolia - 0xa7fF3208e70dD4BE58411F78269561453396AF5E
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {VRFConsumerBaseV2Plus} from "@chainlink/contracts@1.2.0/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts@1.2.0/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";


contract CoreContract is ReentrancyGuard, VRFConsumerBaseV2Plus {
    enum JobStatus { Pending, Processing, Completed, Cancelled }
    enum JobType { Regular, Encrypted }

    struct Video {
        string ipfsHash;
        uint256 duration;
        address uploader;
        uint256 uploadTime;
        bool isEncrypted;
    }

    struct CaptioningJob {
        uint256 videoId;
        address requester;
        uint256 nodeId;
        JobStatus status;
        JobType jobType;
        uint256 creationTime;
        string resultIpfsHash;
        uint256 price;
    }

    struct Node {
        address nodeAddress;
        uint256 stake;
        bool isActive;
        bool isTrusted;
        uint256 totalJobsCompleted;
        uint256 reputation;
    }

    IERC20 public tokenContract;

    bytes32 private immutable keyHash;
    uint256 private immutable subscriptionId;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;

    uint256 public nextVideoId;
    uint256 public nextJobId;
    uint256 public nextNodeId;
    uint256 public jobPrice;
    uint256 public nodeFee;
    uint256 public minStake;

    mapping(uint256 => Video) public videos;
    mapping(uint256 => CaptioningJob) public jobs;
    mapping(uint256 => Node) public nodes;
    mapping(address => uint256) public pendingRewards;
    mapping(address => uint256[]) public userJobs;
    mapping(uint256 => uint256[]) public nodeJobs;
    mapping(uint256 => uint256) private vrfRequests;

    event VideoUploaded(uint256 indexed videoId, address indexed uploader, string ipfsHash, bool isEncrypted);
    event JobCreated(uint256 indexed jobId, uint256 indexed videoId, address indexed requester, JobType jobType);
    event JobStatusUpdated(uint256 indexed jobId, JobStatus newStatus);
    event NodeRegistered(uint256 indexed nodeId, address indexed nodeAddress, uint256 stake, bool isTrusted);
    event NodeDeactivated(uint256 indexed nodeId);
    event NodeSelected(uint256 indexed jobId, uint256 indexed nodeId);
    event JobResultSubmitted(uint256 indexed jobId, string resultIpfsHash);
    event RewardsDistributed(uint256 indexed jobId, address indexed node, uint256 amount);
    event RewardsWithdrawn(address indexed node, uint256 amount);
    event PriceUpdated(uint256 newPrice);
    event NodeFeeUpdated(uint256 newFee);
    event DisputeResolved(uint256 indexed jobId, bool infavorOfNode);

    constructor(
        address _tokenAddress,
        address _vrfCoordinator,
        bytes32 _keyHash,
        uint256 _subscriptionId
    ) VRFConsumerBaseV2Plus(_vrfCoordinator) {
        tokenContract = IERC20(_tokenAddress);
        keyHash = _keyHash;
        subscriptionId = _subscriptionId;
        jobPrice = 100 * 10**18; // 100 tokens
        nodeFee = 80; // 80%
        minStake = 1000 * 10**18; // 1000 tokens
    }

    function uploadVideo(string calldata _ipfsHash, uint256 _duration, bool _isEncrypted) external returns (uint256 videoId) {
        videoId = nextVideoId++;
        videos[videoId] = Video(_ipfsHash, _duration, msg.sender, block.timestamp, _isEncrypted);
        emit VideoUploaded(videoId, msg.sender, _ipfsHash, _isEncrypted);
    }

    function getVideoDetails(uint256 _videoId) external view returns (string memory ipfsHash, uint256 duration, address uploader, bool isEncrypted) {
        Video memory video = videos[_videoId];
        return (video.ipfsHash, video.duration, video.uploader, video.isEncrypted);
    }

    function createJob(uint256 _videoId, JobType _jobType) external nonReentrant returns (uint256 jobId) {
        require(tokenContract.transferFrom(msg.sender, address(this), jobPrice), "Payment failed");
        
        jobId = nextJobId++;
        jobs[jobId] = CaptioningJob(_videoId, msg.sender, 0, JobStatus.Pending, _jobType, block.timestamp, "", jobPrice);
        userJobs[msg.sender].push(jobId);
        emit JobCreated(jobId, _videoId, msg.sender, _jobType);

        // Request a random number to select a node
        selectNode(jobId,true);
        emit JobStatusUpdated(jobId, JobStatus.Processing);
        emit JobCreated(jobId, _videoId, msg.sender, _jobType);
    }

    function getJobStatus(uint256 _jobId) external view returns (JobStatus) {
        return jobs[_jobId].status;
    }

    function cancelJob(uint256 _jobId) external nonReentrant {
        CaptioningJob storage job = jobs[_jobId];
        require(msg.sender == job.requester, "Not job requester");
        require(job.status == JobStatus.Pending, "Job not pending");
        job.status = JobStatus.Cancelled;
        require(tokenContract.transfer(msg.sender, job.price), "Refund failed");
        emit JobStatusUpdated(_jobId, JobStatus.Cancelled);
    }

    function getJobDetails(uint256 _jobId) external view returns (CaptioningJob memory) {
        return jobs[_jobId];
    }

    function getUserJobs(address _user) external view returns (uint256[] memory) {
        return userJobs[_user];
    }

    function registerNode() external payable returns (uint256 nodeId) {
        require(msg.value >= minStake, "Insufficient stake");
        nodeId = nextNodeId++;
        nodes[nodeId] = Node(msg.sender, msg.value, true, false, 0, 0);
        emit NodeRegistered(nodeId, msg.sender, msg.value, false);
    }

    function deactivateNode(uint256 _nodeId) external nonReentrant {
        Node storage node = nodes[_nodeId];
        require(msg.sender == node.nodeAddress, "Not node owner");
        require(node.isActive, "Node already inactive");
        node.isActive = false;
        payable(msg.sender).transfer(node.stake);
        emit NodeDeactivated(_nodeId);
    }

    function getNodeDetails(uint256 _nodeId) external view returns (address nodeAddress, uint256 stake, bool isActive, bool isTrusted, uint256 totalJobsCompleted, uint256 reputation) {
        Node memory node = nodes[_nodeId];
        return (node.nodeAddress, node.stake, node.isActive, node.isTrusted, node.totalJobsCompleted, node.reputation);
    }

    function setTrustedNode(uint256 _nodeId, bool _isTrusted) external onlyOwner {
        nodes[_nodeId].isTrusted = _isTrusted;
    }

    function getNodeJobs(uint256 _nodeId) external view returns (uint256[] memory) {
        return nodeJobs[_nodeId];
    }

    function selectNode(uint256 _jobId,bool enableNativePayment) internal {
        require(jobs[_jobId].status == JobStatus.Pending, "Job not pending");
        
        uint256 requestId = s_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: keyHash,
                subId: subscriptionId,
                requestConfirmations: REQUEST_CONFIRMATIONS,
                callbackGasLimit: 10000,
                numWords: NUM_WORDS,
                extraArgs: VRFV2PlusClient._argsToBytes(
                    VRFV2PlusClient.ExtraArgsV1({
                        nativePayment: enableNativePayment
                    })
                )
            })
        );
        
        vrfRequests[requestId] = _jobId;
        
        jobs[_jobId].status = JobStatus.Processing;
        emit JobStatusUpdated(_jobId, JobStatus.Processing);
    }

    function fulfillRandomWords(uint256 requestId, uint256[] calldata randomWords) internal override {
        uint256 jobId = vrfRequests[requestId];
        require(jobId > 0, "Invalid request ID");
        
        uint256 randomNumber = randomWords[0];
        uint256 selectedNodeId = (randomNumber % nextNodeId) + 1;
        
        while (!nodes[selectedNodeId].isActive && selectedNodeId < nextNodeId) {
            selectedNodeId = (selectedNodeId + 1) % nextNodeId + 1;
        }
        
        require(nodes[selectedNodeId].isActive, "No active nodes available");
        
        jobs[jobId].nodeId = selectedNodeId;
        nodeJobs[selectedNodeId].push(jobId);
        emit NodeSelected(jobId, selectedNodeId);
        
        delete vrfRequests[requestId];
    }

    function submitJobResult(uint256 _jobId, string calldata _resultIpfsHash) external {
        CaptioningJob storage job = jobs[_jobId];
        require(nodes[job.nodeId].nodeAddress == msg.sender, "Not assigned node");
        require(job.status == JobStatus.Processing, "Job not in processing");
        job.status = JobStatus.Completed;
        job.resultIpfsHash = _resultIpfsHash;
        nodes[job.nodeId].totalJobsCompleted++;
        emit JobResultSubmitted(_jobId, _resultIpfsHash);
        emit JobStatusUpdated(_jobId, JobStatus.Completed);
    }

    function distributeRewards(uint256 _jobId) external nonReentrant {
        CaptioningJob storage job = jobs[_jobId];
        require(job.status == JobStatus.Completed, "Job not completed");
        uint256 nodeReward = (job.price * nodeFee) / 100;
        pendingRewards[nodes[job.nodeId].nodeAddress] += nodeReward;
        emit RewardsDistributed(_jobId, nodes[job.nodeId].nodeAddress, nodeReward);
    }

    function withdrawRewards() external nonReentrant returns (uint256 amount) {
        amount = pendingRewards[msg.sender];
        require(amount > 0, "No pending rewards");
        pendingRewards[msg.sender] = 0;
        require(tokenContract.transfer(msg.sender, amount), "Transfer failed");
        emit RewardsWithdrawn(msg.sender, amount);
    }

    function updateJobPrice(uint256 _newPrice) external onlyOwner {
        jobPrice = _newPrice;
        emit PriceUpdated(_newPrice);
    }

    function updateNodeFee(uint256 _newFee) external onlyOwner {
        require(_newFee <= 100, "Fee too high");
        nodeFee = _newFee;
        emit NodeFeeUpdated(_newFee);
    }

    function getplatformStats() external view returns (uint256 totalVideos, uint256 totalJobs, uint256 totalNodes) {
        return (nextVideoId, nextJobId, nextNodeId);
    }

    function handleDispute(uint256 _jobId) external onlyOwner {
        CaptioningJob storage job = jobs[_jobId];
        require(job.status == JobStatus.Completed, "Job not completed");
        
        // This is a simplified dispute resolution. In a real-world scenario,
        // this would involve a more complex process, possibly involving voting or arbitration.
        bool infavorOfNode = true; // This should be determined through some dispute resolution process
        
        if (!infavorOfNode) {
            // If the dispute is resolved against the node, we could implement a slashing mechanism here
            nodes[job.nodeId].reputation--;
        }
        
        emit DisputeResolved(_jobId, infavorOfNode);
    }
}
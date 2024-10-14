// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
// import {VRFConsumerBaseV2Plus} from "@chainlink/contracts@1.2.0/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
// import {VRFV2PlusClient} from "@chainlink/contracts@1.2.0/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IVRF.sol";

contract CoreContract is ReentrancyGuard,Ownable {
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
    IVRF public vrfContract;
    
    bytes32 private immutable keyHash;
    uint256 private immutable subscriptionId;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;
    
    uint256 public nextVideoId;
    uint256 public nextJobId;
    uint256 public nextNodeId;
    uint256 public jobPrice;
    uint256 public nodeFee;
    uint256 public totalStaked;
    uint256 public minStake;
    uint256[] public nodeIds;

    mapping(uint256 => Video) public videos;
    mapping(uint256 => CaptioningJob) public jobs;
    mapping(uint256 => Node) public nodes;
    mapping(address => uint256) public nodesThroughAddress;
    mapping(address => uint256) public pendingRewards;
    mapping(address => uint256[]) public userJobs;
    mapping(uint256 => uint256[]) public nodeJobs;
    mapping(uint256 => uint256) private vrfRequests;
    mapping(uint256 => CaptioningJob) public disputedJobs;

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
    event DisputeCreated(uint256 indexed jobId);
    event DisputeResolved(uint256 indexed jobId, bool infavorOfNode);

    constructor(
       address _tokenAddress,
       address _vrfContractAddress
    ) Ownable(msg.sender){
        vrfContract = IVRF(_vrfContractAddress);
        tokenContract = IERC20(_tokenAddress);
        jobPrice = 10 * 10**18; // 10 tokens
        nodeFee = 80; // 80%
        minStake = 10 * 10**18; // 10 tokens
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
        selectNode(jobId);
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
        require(nodes[nodesThroughAddress[msg.sender]].isActive == false, "Node already registered");
        require(tokenContract.transferFrom(msg.sender, address(this), minStake),"Stake Not Received");
        nodeId = nextNodeId++;
        nodeIds.push(nodeId);
        nodes[nodeId] = Node(msg.sender, msg.value, true, false, 0, 0);
        nodesThroughAddress[msg.sender] = nodeId;
        totalStaked += msg.value;
        emit NodeRegistered(nodeId, msg.sender, msg.value, false);
    }

    function deactivateNode(uint256 _nodeId) external nonReentrant {
        Node storage node = nodes[_nodeId];
        require(msg.sender == node.nodeAddress, "Not node owner");
        require(node.isActive, "Node already inactive");
        node.isActive = false;
        tokenContract.transferFrom(address(this),msg.sender,nodes[_nodeId].stake);
        totalStaked -= nodes[_nodeId].stake;
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

  function selectNode(uint256 _jobId) internal {
     
       
    require(jobs[_jobId].status == JobStatus.Pending, "Job not pending");
    require(totalStaked > 0, "No nodes staked");
    
    uint256 requestId = vrfContract.requestRandomWords(1);
    vrfRequests[requestId] = _jobId;
    
    jobs[_jobId].status = JobStatus.Processing;
    emit JobStatusUpdated(_jobId, JobStatus.Processing);

    // Check if the request was immediately fulfilled (for non-Chainlink implementation)
    (bool fulfilled, ) = vrfContract.getRequestStatus(requestId);
    if (fulfilled) {
        fulfillRandomness(_jobId);
    
}

        // require(jobs[_jobId].status == JobStatus.Pending, "Job not pending");
        // require(totalStaked > 0, "No nodes staked");
        
        // uint256 requestId = vrfContract.requestRandomWords(1);
        // vrfRequests[requestId] = _jobId;
        
        // jobs[_jobId].status = JobStatus.Processing;
        // emit JobStatusUpdated(_jobId, JobStatus.Processing);

        // // Check if the request was immediately fulfilled (for AlternativeVRF)
        // (bool fulfilled, ) = vrfContract.getRequestStatus(requestId);
        // if (fulfilled) {
        //     fulfillRandomness(_jobId);
        // }
    }

    function fulfillRandomness(uint256 _jobId) public {
        uint256 requestId = vrfRequests[_jobId];
        (bool fulfilled, uint256[] memory randomWords) = vrfContract.getRequestStatus(requestId);
        require(fulfilled, "Random number not yet available");
        require(jobs[_jobId].status == JobStatus.Processing, "Job not processing");

        uint256 randomValue = randomWords[0] % totalStaked;
        Node memory selectedNode = selectNodeByStake(randomValue);

        jobs[_jobId].nodeId = nodesThroughAddress[selectedNode.nodeAddress];
        jobs[_jobId].status = JobStatus.Completed;

        emit JobStatusUpdated(_jobId, JobStatus.Processing);
        emit NodeSelected(_jobId, nodesThroughAddress[selectedNode.nodeAddress]);
    }

    function selectNodeByStake(uint256 randomValue ) internal view returns (Node memory selectedNode) {
        uint256 cumulativeStake = 0;
        for (uint i = 0; i < nodeIds.length; i++) {
            Node memory node = nodes[i];
            cumulativeStake += node.stake;
            if (randomValue < cumulativeStake) {
                return node;
            }
        }
        return nodes[nodeIds.length - 1]; // Fallback to last node if something goes wrong
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

    function createDispute(uint256 _jobId) external {
        CaptioningJob storage job = jobs[_jobId];
        require(job.status == JobStatus.Completed, "Job not completed");
        disputedJobs[_jobId] = job;
        emit DisputeCreated(_jobId);
    }

    function handleDispute(uint256 _jobId, bool _infavour) external onlyOwner {
        CaptioningJob storage job = jobs[_jobId];
        require(job.status == JobStatus.Completed, "Job not completed");

        bool infavorOfNode = _infavour; 

        if (!infavorOfNode) {
            nodes[job.nodeId].reputation--;
            require(tokenContract.transferFrom(nodes[job.nodeId].nodeAddress,address(this),nodes[job.nodeId].stake));
        }
        delete disputedJobs[_jobId];
        emit DisputeResolved(_jobId, infavorOfNode);
    }
}
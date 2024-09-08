const data = {
  name: "Core",
  address: "",
  abi: [
    {
      inputs: [
        {
          internalType: "address",
          name: "_tokenAddress",
          type: "address",
        },
        {
          internalType: "address",
          name: "_vrfCoordinator",
          type: "address",
        },
        {
          internalType: "bytes32",
          name: "_keyHash",
          type: "bytes32",
        },
        {
          internalType: "uint256",
          name: "_subscriptionId",
          type: "uint256",
        },
      ],
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "have",
          type: "address",
        },
        {
          internalType: "address",
          name: "want",
          type: "address",
        },
      ],
      name: "OnlyCoordinatorCanFulfill",
      type: "error",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "have",
          type: "address",
        },
        {
          internalType: "address",
          name: "owner",
          type: "address",
        },
        {
          internalType: "address",
          name: "coordinator",
          type: "address",
        },
      ],
      name: "OnlyOwnerOrCoordinator",
      type: "error",
    },
    {
      inputs: [],
      name: "ZeroAddress",
      type: "error",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "address",
          name: "vrfCoordinator",
          type: "address",
        },
      ],
      name: "CoordinatorSet",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "jobId",
          type: "uint256",
        },
      ],
      name: "DisputeCreated",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "jobId",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "bool",
          name: "infavorOfNode",
          type: "bool",
        },
      ],
      name: "DisputeResolved",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "jobId",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "uint256",
          name: "videoId",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "address",
          name: "requester",
          type: "address",
        },
        {
          indexed: false,
          internalType: "enum CoreContract.JobType",
          name: "jobType",
          type: "uint8",
        },
      ],
      name: "JobCreated",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "jobId",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "string",
          name: "resultIpfsHash",
          type: "string",
        },
      ],
      name: "JobResultSubmitted",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "jobId",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "enum CoreContract.JobStatus",
          name: "newStatus",
          type: "uint8",
        },
      ],
      name: "JobStatusUpdated",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "nodeId",
          type: "uint256",
        },
      ],
      name: "NodeDeactivated",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "uint256",
          name: "newFee",
          type: "uint256",
        },
      ],
      name: "NodeFeeUpdated",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "nodeId",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "address",
          name: "nodeAddress",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "stake",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "bool",
          name: "isTrusted",
          type: "bool",
        },
      ],
      name: "NodeRegistered",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "jobId",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "uint256",
          name: "nodeId",
          type: "uint256",
        },
      ],
      name: "NodeSelected",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "from",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "to",
          type: "address",
        },
      ],
      name: "OwnershipTransferRequested",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "from",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "to",
          type: "address",
        },
      ],
      name: "OwnershipTransferred",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "uint256",
          name: "newPrice",
          type: "uint256",
        },
      ],
      name: "PriceUpdated",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "jobId",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "address",
          name: "node",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
      ],
      name: "RewardsDistributed",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "node",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
      ],
      name: "RewardsWithdrawn",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "videoId",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "address",
          name: "uploader",
          type: "address",
        },
        {
          indexed: false,
          internalType: "string",
          name: "ipfsHash",
          type: "string",
        },
        {
          indexed: false,
          internalType: "bool",
          name: "isEncrypted",
          type: "bool",
        },
      ],
      name: "VideoUploaded",
      type: "event",
    },
    {
      inputs: [],
      name: "acceptOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      name: "addressToNodeId",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "_jobId",
          type: "uint256",
        },
      ],
      name: "cancelJob",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "_jobId",
          type: "uint256",
        },
      ],
      name: "createDispute",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "_videoId",
          type: "uint256",
        },
        {
          internalType: "enum CoreContract.JobType",
          name: "_jobType",
          type: "uint8",
        },
      ],
      name: "createJob",
      outputs: [
        {
          internalType: "uint256",
          name: "jobId",
          type: "uint256",
        },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "_nodeId",
          type: "uint256",
        },
      ],
      name: "deactivateNode",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      name: "disputedJobs",
      outputs: [
        {
          internalType: "uint256",
          name: "videoId",
          type: "uint256",
        },
        {
          internalType: "address",
          name: "requester",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "nodeId",
          type: "uint256",
        },
        {
          internalType: "enum CoreContract.JobStatus",
          name: "status",
          type: "uint8",
        },
        {
          internalType: "enum CoreContract.JobType",
          name: "jobType",
          type: "uint8",
        },
        {
          internalType: "uint256",
          name: "creationTime",
          type: "uint256",
        },
        {
          internalType: "string",
          name: "resultIpfsHash",
          type: "string",
        },
        {
          internalType: "uint256",
          name: "price",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "_jobId",
          type: "uint256",
        },
      ],
      name: "distributeRewards",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "_jobId",
          type: "uint256",
        },
      ],
      name: "getJobDetails",
      outputs: [
        {
          components: [
            {
              internalType: "uint256",
              name: "videoId",
              type: "uint256",
            },
            {
              internalType: "address",
              name: "requester",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "nodeId",
              type: "uint256",
            },
            {
              internalType: "enum CoreContract.JobStatus",
              name: "status",
              type: "uint8",
            },
            {
              internalType: "enum CoreContract.JobType",
              name: "jobType",
              type: "uint8",
            },
            {
              internalType: "uint256",
              name: "creationTime",
              type: "uint256",
            },
            {
              internalType: "string",
              name: "resultIpfsHash",
              type: "string",
            },
            {
              internalType: "uint256",
              name: "price",
              type: "uint256",
            },
          ],
          internalType: "struct CoreContract.CaptioningJob",
          name: "",
          type: "tuple",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "_jobId",
          type: "uint256",
        },
      ],
      name: "getJobStatus",
      outputs: [
        {
          internalType: "enum CoreContract.JobStatus",
          name: "",
          type: "uint8",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_nodeAddress",
          type: "address",
        },
      ],
      name: "getNodeDetails",
      outputs: [
        {
          internalType: "uint256",
          name: "nodeId",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "stake",
          type: "uint256",
        },
        {
          internalType: "bool",
          name: "isActive",
          type: "bool",
        },
        {
          internalType: "bool",
          name: "isTrusted",
          type: "bool",
        },
        {
          internalType: "uint256",
          name: "totalJobsCompleted",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "reputation",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "_nodeId",
          type: "uint256",
        },
      ],
      name: "getNodeJobs",
      outputs: [
        {
          internalType: "uint256[]",
          name: "",
          type: "uint256[]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_user",
          type: "address",
        },
      ],
      name: "getUserJobs",
      outputs: [
        {
          internalType: "uint256[]",
          name: "",
          type: "uint256[]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "_videoId",
          type: "uint256",
        },
      ],
      name: "getVideoDetails",
      outputs: [
        {
          internalType: "string",
          name: "ipfsHash",
          type: "string",
        },
        {
          internalType: "uint256",
          name: "duration",
          type: "uint256",
        },
        {
          internalType: "address",
          name: "uploader",
          type: "address",
        },
        {
          internalType: "bool",
          name: "isEncrypted",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "getplatformStats",
      outputs: [
        {
          internalType: "uint256",
          name: "totalVideos",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "totalJobs",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "totalNodes",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "_jobId",
          type: "uint256",
        },
        {
          internalType: "bool",
          name: "_infavour",
          type: "bool",
        },
      ],
      name: "handleDispute",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "jobPrice",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      name: "jobs",
      outputs: [
        {
          internalType: "uint256",
          name: "videoId",
          type: "uint256",
        },
        {
          internalType: "address",
          name: "requester",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "nodeId",
          type: "uint256",
        },
        {
          internalType: "enum CoreContract.JobStatus",
          name: "status",
          type: "uint8",
        },
        {
          internalType: "enum CoreContract.JobType",
          name: "jobType",
          type: "uint8",
        },
        {
          internalType: "uint256",
          name: "creationTime",
          type: "uint256",
        },
        {
          internalType: "string",
          name: "resultIpfsHash",
          type: "string",
        },
        {
          internalType: "uint256",
          name: "price",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "minStake",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "nextJobId",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "nextNodeId",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "nextVideoId",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "nodeFee",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      name: "nodeIds",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      name: "nodeJobs",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      name: "nodes",
      outputs: [
        {
          internalType: "address",
          name: "nodeAddress",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "stake",
          type: "uint256",
        },
        {
          internalType: "bool",
          name: "isActive",
          type: "bool",
        },
        {
          internalType: "bool",
          name: "isTrusted",
          type: "bool",
        },
        {
          internalType: "uint256",
          name: "totalJobsCompleted",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "reputation",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      name: "nodesThroughAddress",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "owner",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      name: "pendingRewards",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "requestId",
          type: "uint256",
        },
        {
          internalType: "uint256[]",
          name: "randomWords",
          type: "uint256[]",
        },
      ],
      name: "rawFulfillRandomWords",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "registerNode",
      outputs: [
        {
          internalType: "uint256",
          name: "nodeId",
          type: "uint256",
        },
      ],
      stateMutability: "payable",
      type: "function",
    },
    {
      inputs: [],
      name: "s_vrfCoordinator",
      outputs: [
        {
          internalType: "contract IVRFCoordinatorV2Plus",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_vrfCoordinator",
          type: "address",
        },
      ],
      name: "setCoordinator",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "_nodeId",
          type: "uint256",
        },
        {
          internalType: "bool",
          name: "_isTrusted",
          type: "bool",
        },
      ],
      name: "setTrustedNode",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "_jobId",
          type: "uint256",
        },
        {
          internalType: "string",
          name: "_resultIpfsHash",
          type: "string",
        },
      ],
      name: "submitJobResult",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "tokenContract",
      outputs: [
        {
          internalType: "contract IERC20",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "totalStaked",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "to",
          type: "address",
        },
      ],
      name: "transferOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "_newPrice",
          type: "uint256",
        },
      ],
      name: "updateJobPrice",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "_newFee",
          type: "uint256",
        },
      ],
      name: "updateNodeFee",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "string",
          name: "_ipfsHash",
          type: "string",
        },
        {
          internalType: "uint256",
          name: "_duration",
          type: "uint256",
        },
        {
          internalType: "bool",
          name: "_isEncrypted",
          type: "bool",
        },
      ],
      name: "uploadVideo",
      outputs: [
        {
          internalType: "uint256",
          name: "videoId",
          type: "uint256",
        },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      name: "userJobs",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      name: "videos",
      outputs: [
        {
          internalType: "string",
          name: "ipfsHash",
          type: "string",
        },
        {
          internalType: "uint256",
          name: "duration",
          type: "uint256",
        },
        {
          internalType: "address",
          name: "uploader",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "uploadTime",
          type: "uint256",
        },
        {
          internalType: "bool",
          name: "isEncrypted",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "withdrawRewards",
      outputs: [
        {
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
  ],
} as const;

export default data;

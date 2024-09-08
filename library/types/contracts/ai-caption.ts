const data = {
  name: "AICaption",
  address: "",
  abi: [
    {
      inputs: [
        {
          internalType: "address",
          name: "initialOracleAddress",
          type: "address",
        },
      ],
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "owner",
          type: "address",
        },
        {
          indexed: true,
          internalType: "uint256",
          name: "jobId",
          type: "uint256",
        },
      ],
      name: "CaptioningJobCreated",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "newOracleAddress",
          type: "address",
        },
      ],
      name: "OracleAddressUpdated",
      type: "event",
    },
    {
      inputs: [
        {
          internalType: "string",
          name: "caption",
          type: "string",
        },
        {
          internalType: "uint256",
          name: "jobId",
          type: "uint256",
        },
      ],
      name: "addCaption",
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
      name: "captioningJobs",
      outputs: [
        {
          internalType: "address",
          name: "owner",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "jobId",
          type: "uint256",
        },
      ],
      name: "getCaptionHistory",
      outputs: [
        {
          components: [
            {
              internalType: "string",
              name: "role",
              type: "string",
            },
            {
              components: [
                {
                  internalType: "string",
                  name: "contentType",
                  type: "string",
                },
                {
                  internalType: "string",
                  name: "value",
                  type: "string",
                },
              ],
              internalType: "struct IOracle.Content[]",
              name: "content",
              type: "tuple[]",
            },
          ],
          internalType: "struct IOracle.Message[]",
          name: "",
          type: "tuple[]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "jobId",
          type: "uint256",
        },
        {
          components: [
            {
              internalType: "string",
              name: "id",
              type: "string",
            },
            {
              internalType: "string",
              name: "content",
              type: "string",
            },
            {
              internalType: "string",
              name: "functionName",
              type: "string",
            },
            {
              internalType: "string",
              name: "functionArguments",
              type: "string",
            },
            {
              internalType: "uint64",
              name: "created",
              type: "uint64",
            },
            {
              internalType: "string",
              name: "model",
              type: "string",
            },
            {
              internalType: "string",
              name: "systemFingerprint",
              type: "string",
            },
            {
              internalType: "string",
              name: "object",
              type: "string",
            },
            {
              internalType: "uint32",
              name: "completionTokens",
              type: "uint32",
            },
            {
              internalType: "uint32",
              name: "promptTokens",
              type: "uint32",
            },
            {
              internalType: "uint32",
              name: "totalTokens",
              type: "uint32",
            },
          ],
          internalType: "struct IOracle.OpenAiResponse",
          name: "response",
          type: "tuple",
        },
        {
          internalType: "string",
          name: "errorMessage",
          type: "string",
        },
      ],
      name: "onOracleCaptionResponse",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "oracleAddress",
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
          name: "newOracleAddress",
          type: "address",
        },
      ],
      name: "setOracleAddress",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "string",
          name: "videoUrl",
          type: "string",
        },
        {
          internalType: "string[]",
          name: "imageUrls",
          type: "string[]",
        },
      ],
      name: "startCaption",
      outputs: [
        {
          internalType: "uint256",
          name: "",
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
          name: "",
          type: "uint256",
        },
      ],
      name: "storedContents",
      outputs: [
        {
          internalType: "string",
          name: "contentType",
          type: "string",
        },
        {
          internalType: "string",
          name: "value",
          type: "string",
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
      name: "storedMessages",
      outputs: [
        {
          internalType: "string",
          name: "role",
          type: "string",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
  ],
} as const;

export default data;

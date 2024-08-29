# Crystalrohr

Decentralized Video Captioning Protocol Flow

### User Journey Flow

This represents the general flow of what the user should interact with and how the user experience should feel

```mermaid
graph TD
    A[User visits website] --> B[User authenticates/logs in]
    B --> C[User connects wallet]
    C --> D[User lands on dashboard]

    D --> E{New user?}
    E -->|Yes| F[Onboarding process]
    E -->|No| G[Video Auto Caption Service]
    F --> G
    G --> H[User clicks 'Upload Video']
    H --> I[User selects video file]
    I --> J[User confirms upload]
    J --> K[System processes video]
    K --> L[User views progress bar]
    L --> M[System completes captioning]
    M --> N[User receives notification]
    N --> O[User reviews auto-generated captions]
    O --> P{User satisfied?}
    P -->|Yes| Q[User downloads captioned video]
    P -->|No| R[User edits captions]
    R --> S[User saves changes]
    S --> Q
    Q --> T[User shares video]
    T --> G

    D --> U[DePIN Network Participation]
    U --> V{User staked?}
    V --> |Yes| W[User clicks 'Contribute Resources']
    V --> |No| X[User clicks 'Stakes Token']
    X --> W
    W --> Y[User starts contributing]
    Y --> Z[User earns tokens]
    Z --> AA[User views contribution stats]

    D --> AB[Token Management]
    AB --> AC[User views token balance]
    AC --> AD[User purchases more tokens]
    AD --> AE[User sets auto-recharge]
    AC --> AF[User withdraws tokens]

    D --> AG[Account Management]
    AG --> AH[User updates profile]
    AH --> AI[User views captioning history]
    AI --> AJ[User manages subscriptions]
```

### Decentralized Video Captioning Flow

The system outlines a decentralized video captioning service using multiple blockchains, allowing secure processing and efficient caption generation through specialized node selection and blockchain interactions.

```mermaid
graph TD
    subgraph "Client Side"
        A[User Authenticates] --> B[Initiates Captioning with Regular/Encrypted Job]
        B --> C[Upload Video to IPFS]
        C --> D[Get IPFS Link]
        D --> E[User Selects Primary Blockchain]
    end

    subgraph "Protocol Side"
        E --> I[Contract Receives Request]
        I --> J[VRF Service]
        J --> K[Weighted Random Algorithm]
        K --> L{Encrypted Job?}
        L -->|No| N[Proceed with Regular Job]

        L -->|Yes| M[Use Lit Protocol for Encryption]
        M --> O[Select from Trusted Nodes]
        N --> P[Select from All Nodes]
        O --> Q[Assign Video Processing Task]
        P --> Q
        Q --> R[Node Processes Video]
        R --> S[Node Extracts Video Stills]
        S --> T[Node Sends Stills to Galadriel Blockchain]
        T --> U[Galadriel Processes Video Stills]
        U --> V[Vision Model Generates Captions]
        V --> W[Node Retrieves Captions from Galadriel]
        W --> X[Node Compiles Final Captioned Video]
        X --> Y[Attestation of Correctness]
        Y --> Z[Validate Result]
        Z --> AA[Update User Balance]
        AA --> AB[Reward Computing Nodes]
    end

    subgraph "External Services"
        AC[IPFS]
        AD[Primary Blockchain Networks]
        AE[Galadriel Blockchain]
        AG[VRF Service]
        AH[Lit Protocol]
        AI[Web3Auth]
        AJ[Attestation protocol]
    end

    A --> AI
    B --> AH
    C --> AC
    E --> AD
    J --> AG
    M --> AH
    T --> AE
    W --> AE
    Y --> AJ
```

// "use client";

// import { ADAPTER_EVENTS, CHAIN_NAMESPACES, IProvider, WEB3AUTH_NETWORK } from "@web3auth/base";
// import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
// import { decodeToken, Web3Auth } from "@web3auth/single-factor-auth";
// // Firebase libraries for custom authentication
// import { initializeApp } from "firebase/app";
// import { getAuth, GoogleAuthProvider, signInWithPopup, UserCredential } from "firebase/auth";
// import { useEffect, useState } from "react";
// import Web3 from "web3";
// import { User, Users } from 'lucide-react';
// import Link from 'next/link';


// const clientId = "BPi5PB_UiIZ-cPz1GtV5i1I2iOSOHuimiXBI0e-Oe_u6X3oVAbCiAZOTEBtTXw4tsluTITPqA8zMsfxIKMjiqNQ"; // get from https://dashboard.web3auth.io

// const verifier = "w3a-firebase-demo";

// const chainConfig = {
//   chainNamespace: CHAIN_NAMESPACES.EIP155,
//   chainId: "0x1", // Please use 0x1 for Mainnet
//   rpcTarget: "https://rpc.ankr.com/eth",
//   displayName: "Ethereum Mainnet",
//   blockExplorer: "https://etherscan.io/",
//   ticker: "ETH",
//   tickerName: "Ethereum",
// };

// const privateKeyProvider = new EthereumPrivateKeyProvider({
//   config: { chainConfig },
// });

// const web3auth = new Web3Auth({
//   clientId, // Get your Client ID from Web3Auth Dashboard
//   web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_MAINNET,
//   privateKeyProvider,
// });


// // Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyB0nd9YsPLu-tpdCrsXn8wgsWVAiYEpQ_E",
//   authDomain: "web3auth-oauth-logins.firebaseapp.com",
//   projectId: "web3auth-oauth-logins",
//   storageBucket: "web3auth-oauth-logins.appspot.com",
//   messagingSenderId: "461819774167",
//   appId: "1:461819774167:web:e74addfb6cc88f3b5b9c92",
// };

// function LoginButton() {
//   const [provider, setProvider] = useState<IProvider | null>(null);
//   const [loggedIn, setLoggedIn] = useState(false);

//   // Firebase Initialisation
//   const app = initializeApp(firebaseConfig);

//   useEffect(() => {
//     const init = async () => {
//       try {
//         await web3auth.init();
//         setProvider(web3auth.provider);

//         if (web3auth.status === ADAPTER_EVENTS.CONNECTED) {
//           setLoggedIn(true);
//         }
//       } catch (error) {
//         console.error(error);
//       }
//     };

//     init();
//   }, []);

//   const signInWithGoogle = async (): Promise<UserCredential> => {
//     try {
//       const auth = getAuth(app);
//       const googleProvider = new GoogleAuthProvider();
//       const res = await signInWithPopup(auth, googleProvider);
//       console.log(res);
//       return res;
//     } catch (err) {
//       console.error(err);
//       throw err;
//     }
//   };

//   const login = async () => {
//     if (!web3auth) {
//       console.error("web3auth not initialized yet");
//       return;
//     }
  
//     // Check if already connected
//     if (web3auth.status === ADAPTER_EVENTS.CONNECTED) {
//       console.log("Already connected");
//       return;
//     }
  
//     try {
//       // Login with Firebase
//       const loginRes = await signInWithGoogle();
//       // Get the ID token from Firebase
//       const idToken = await loginRes.user.getIdToken(true);
//       const { payload } = decodeToken(idToken);
  
//       // Connect with Web3Auth
//       const web3authProvider = await web3auth.connect({
//         verifier,
//         verifierId: (payload as any).sub,
//         idToken,
//       });
  
//       if (web3authProvider) {
//         setLoggedIn(true);
//         setProvider(web3authProvider);
//       }
//     } catch (err) {
//       console.error("Error during login:", err);
//       // Handle the error (e.g., show an error message to the user)
//     }
//   };
  

//   const getUserInfo = async () => {
//     const user = await web3auth.getUserInfo();
//     uiConsole(user);
//   };

//   const logout = async () => {
//     await web3auth.logout();
//     setProvider(null);
//     setLoggedIn(false);
//     uiConsole("logged out");
//   };

//   const getAccounts = async () => {
//     if (!provider) {
//       uiConsole("provider not initialized yet");
//       return;
//     }
//     const web3 = new Web3(provider as any);

//     // Get user's Ethereum public address
//     const address = await web3.eth.getAccounts();
//     uiConsole(address);
//   };

//   const getBalance = async () => {
//     if (!provider) {
//       uiConsole("provider not initialized yet");
//       return;
//     }
//     const web3 = new Web3(provider as any);

//     // Get user's Ethereum public address
//     const address = (await web3.eth.getAccounts())[0];

//     // Get user's balance in ether
//     const balance = web3.utils.fromWei(
//       await web3.eth.getBalance(address), // Balance is in wei
//       "ether"
//     );
//     uiConsole(balance);
//   };

//   const signMessage = async () => {
//     if (!provider) {
//       uiConsole("provider not initialized yet");
//       return;
//     }
//     const web3 = new Web3(provider as any);

//     // Get user's Ethereum public address
//     const fromAddress = (await web3.eth.getAccounts())[0];

//     const originalMessage = "YOUR_MESSAGE";

//     // Sign the message
//     const signedMessage = await web3.eth.personal.sign(
//       originalMessage,
//       fromAddress,
//       "test password!" // configure your own password here.
//     );
//     uiConsole(signedMessage);
//   };

//   function uiConsole(...args: any[]): void {
//     const el = document.querySelector("#console>p");
//     if (el) {
//       el.innerHTML = JSON.stringify(args || {}, null, 2);
//     }
//     console.log(...args);
//   }

//   const loggedInView = (
//     <>
//       <div className="flex-container">
//         <div>
//           <button onClick={getUserInfo} className="card">
//             Get User Info
//           </button>
//         </div>
//         <div>
//           <button onClick={getAccounts} className="card">
//             Get Accounts
//           </button>
//         </div>
//         <div>
//           <button onClick={getBalance} className="card">
//             Get Balance
//           </button>
//         </div>
//         <div>
//           <button onClick={signMessage} className="card">
//             Sign Message
//           </button>
//         </div>
//         <div>
//           <button onClick={logout} className="card">
//             Log Out
//           </button>
//         </div>
//       </div>
//     </>
//   );

//   const unloggedInView = (
//     <div className="w-screen min-h-screen flex flex-col items-center justify-start py-20 bg-black text-white px-4">
//       <div className="relative z-10 text-center mb-12">
//         <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#3f169e] to-[#5211eb]">
//           Choose Your Role
//         </h1>
//         <p className="text-xl text-gray-300">
//           Are you here to create or to explore the vast universe of content?
//         </p>
//       </div>
//       <div className="flex flex-col md:flex-row gap-8 w-full max-w-4xl">
//       <div className="hover:scale-110 transition duration-100 ease-in-out" onClick={login}>
//         <div className="flex-1 bg-gradient-to-r from-[#3f169e] to-[#5e2dd0] rounded-lg p-6 ">
//           <div className="bg-black bg-opacity-30 rounded-lg p-5 h-full flex flex-col items-center justify-center border-2 border-transparent ">
//             <User size={64} className="mb-4 text-purple-400 group-hover:text-purple-300 transition-colors duration-300" />
//             <h2 className="text-2xl text-white font-semibold mb-2">Client</h2>
//             <p className="text-gray-300 text-center">
//               Craft immersive experiences and share your vision with the world.
//             </p>
//           </div>
//         </div>
//         </div>
//         <div className="hover:scale-110 transition duration-100 ease-in-out" onClick={login}>
//         <div className="flex-1 bg-gradient-to-r from-[#3f169e] to-[#550EFB] rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer group">
//           <div className="bg-black bg-opacity-30 rounded-lg p-6 h-full flex flex-col items-center justify-center">
//             <Users size={64} className="mb-4 text-blue-400 group-hover:text-blue-300 transition-colors duration-300" />
//             <h2 className="text-2xl font-semibold mb-2">Node</h2>
//             <p className="text-gray-300 text-center">
//               Discover amazing content and embark on a journey through creativity.
//             </p>
//             {/* <button onClick={()=>setRole('Node')}><a href="" className='text-blue-600'>Login</a></button> */}
//           </div>
//         </div>
//         </div>
//       </div>
//     </div>
//   );

//   return (
//     <div className="container">
//       {/* <h1 className="title">
//         <a target="_blank" href="https://web3auth.io/docs/sdk/core-kit/sfa-web" rel="noreferrer">
//           Web3Auth Single Factor Auth
//         </a>{" "}
//         & NextJS Quick Start
//       </h1> */}

//       <div className="grid">{loggedIn ? loggedInView : unloggedInView}</div>
//       {/* <div id="console" style={{ whiteSpace: "pre-line" }}>
//         <p style={{ whiteSpace: "pre-line" }}></p>
//       </div> */}

//       {/* <footer className="footer">
//         <a
//           href="https://github.com/Web3Auth/web3auth-core-kit-examples/tree/main/single-factor-auth-web/quick-starts/sfa-nextjs-quick-start"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Source code
//         </a>
//       </footer> */}
//     </div>
//   );
// }

// export default LoginButton;
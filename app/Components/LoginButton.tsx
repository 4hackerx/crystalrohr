import { useRouter } from 'next/navigation';
import React, { useEffect, useState, useCallback } from 'react'
import { useAccount, useConnect } from 'wagmi'

const LoginButton = ({title, desc}: {title: string, desc: string}) => {
    const { connect, connectors } = useConnect();
    const router = useRouter();
    const { isConnected } = useAccount();
    const [typeUser, setTypeUser] = useState<string | null>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('userType');
        }
        return null;
    });
    
    const handleRedirect = useCallback(() => {
        console.log("Redirect function called");
        console.log("isConnected:", isConnected);
        console.log("typeUser:", typeUser);
        
        if (isConnected && typeUser) {
            if (typeUser === "User") {
                console.log("Redirecting to user dashboard");
                router.push('/user-dashboard');
            } else {
                console.log("Redirecting to node dashboard");
                router.push('/node-dashboard');
            }
        } else {
            console.log("Not redirecting. isConnected or typeUser is falsy");
        }
    }, [isConnected, typeUser, router]);

    useEffect(() => {
        console.log("useEffect triggered");
        if (isConnected && typeUser) {
            handleRedirect();
        }
    }, [isConnected, typeUser, handleRedirect])
  
    const handleLogin = async () => {
        console.log("Login button clicked");
        const newUserType = title;
        setTypeUser(newUserType);
        localStorage.setItem('userType', newUserType);
        console.log("typeUser set to:", newUserType);
        try {
            await connect({ connector: connectors[0] });
            console.log("Connection successful");
        } catch (error) {
            console.error("Connection failed:", error);
        }
    }

    return (
        <div className="hover:scale-110 transition duration-100 ease-in-out" onClick={handleLogin}>
            <div className="flex-1 bg-gradient-to-r from-[#3f169e] to-[#5e2dd0] rounded-lg p-6 ">
                <div className="bg-black bg-opacity-30 rounded-lg p-5 h-[15rem] flex flex-col items-center justify-center border-2 border-transparent ">
                    <h2 className="text-2xl text-white font-semibold mb-2">{title}</h2>
                    <p className="text-gray-300 text-center">
                        {desc}
                    </p>
                </div>
            </div>
        </div>
    )
}

export default LoginButton
import React from 'react'
import { useDisconnect } from 'wagmi'

const DisconnectButton = () => {
    const {disconnect,connectors} = useDisconnect();

  return (
    <div>
        <button className="bg-[#3A0CA5] text-white p-5 rounded-full" onClick={() => {
          disconnect({connector:connectors[0]})}
          
          }>Disconnect</button>
    </div>
  )
}

export default DisconnectButton
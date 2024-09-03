"use client"
import React, { useState } from 'react';

const Dashboard = () => {
  const [stakeAmount, setStakeAmount] = useState('');
  const [isStaked, setIsStaked] = useState(false);
  const [isContributing, setIsContributing] = useState(false);
  const [stakedAmount, setStakedAmount] = useState('0');

  const handleStake = () => {
    if (stakeAmount && !isNaN(parseFloat(stakeAmount)) && parseFloat(stakeAmount) > 0) {
      setStakedAmount(stakeAmount);
      setIsStaked(true);
      setStakeAmount(''); // Clear the input field
    } else {
      alert('Please enter a valid stake amount.');
    }
  };

  const toggleContribution = () => {
    setIsContributing(prevState => !prevState);
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-8 text-[#550EFB]">Node Dashboard</h1>
      
      {/* Staking Section */}
      <div className="bg-gradient-to-r from-[#550EFB] to-[#360C99] border border-[#360C99] rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4 text-white">Stake Your Tokens</h2>
        {!isStaked ? (
          <>
            <p className="mb-4">Contribute by staking your tokens and earn rewards.</p>
            <div className="flex items-center space-x-4">
              <input
                type="number"
                placeholder="Amount to stake"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                className="bg-black text-white border border-[#360C99] rounded p-2 flex-grow"
              />
              <button 
                onClick={handleStake}
                className="bg-[#550EFB] hover:bg-[#360C99] text-white rounded px-4 py-2"
              >
                Stake
              </button>
            </div>
          </>
        ) : (
          <div className="text-center">
            <p className="text-xl mb-2">Amount Staked:</p>
            <p className="text-3xl font-bold text-white">{stakedAmount} tokens</p>
          </div>
        )}
      </div>
      
      {/* Contribution Section */}
      {isStaked && (
        <div className="bg-gradient-to-r from-[#550EFB] to-[#360C99] border border-[#360C99] rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-white">Contribute Resources</h2>
          <p className="mb-4">Start or stop contributing your resources to the network.</p>
          <button 
            onClick={toggleContribution}
            className={`${
              isContributing ? 'bg-[#1c074d]' : 'bg-[#240a61]'
            } hover:bg-[#360C99] text-white rounded px-4 py-2 flex items-center`}
          >
            {isContributing ? 'Stop Contributing' : 'Start Contributing'}
          </button>
        </div>
      )}
      
      {/* Why Stake Section */}
      <div className="bg-gradient-to-r from-[#550EFB] to-[#360C99] border border-[#360C99] rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-white">Why Stake?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center text-center">
            <div className="text-[#550EFB] text-4xl mb-4">🔒</div>
            <h3 className="text-xl font-semibold mb-2 text-white">Secure the Network</h3>
            <p>Help maintain the integrity and security of the blockchain network.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="text-[#550EFB] text-4xl mb-4">📈</div>
            <h3 className="text-xl font-semibold mb-2 text-white">Earn Rewards</h3>
            <p>Receive staking rewards for your contribution to the network.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="text-[#550EFB] text-4xl mb-4">🛡️</div>
            <h3 className="text-xl font-semibold mb-2 text-white">Governance Rights</h3>
            <p>Participate in network governance and decision-making processes.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
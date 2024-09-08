"use client"
import React, { useState } from 'react';
import { Coins, ShoppingCart, CreditCard, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useBalance,  useWatchContractEvent,  useWriteContract } from 'wagmi';
import { tokenABI } from '@/abi/tokenABI';
import { toast } from 'react-toastify';

const TokenManagementPage = () => {
  const [totalTokens, setTotalTokens] = useState(1000);
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [transactions, setTransactions] = useState([
    { type: 'Purchase', amount: 500, date: '2024-09-01' },
    { type: 'Withdraw', amount: 200, date: '2024-08-28' },
    { type: 'Purchase', amount: 1000, date: '2024-08-25' },
  ]);
  
    const result = useBalance({
      address: '0xba17Bd12b3C6d0b4679Fe1bdfb78eB95F057E685',
      token:"0xa4469D636e79FA46C4E1d320c96E647db59E5a36",
      chainId:11155111
    })

    const {writeContract} = useWriteContract();
    useWatchContractEvent({
      address: '0xa4469D636e79FA46C4E1d320c96E647db59E5a36',
      abi:tokenABI,
      eventName: 'Minted',
      onLogs(logs) {
        toast("1000 Tokens sent to your wallet");
      },
    })
  // const handleP urchase = () => {
  //   const amount = parseInt(purchaseAmount);
  //   if (!isNaN(amount) && amount > 0) {
  //     setTotalTokens(prevTokens => prevTokens + amount);
  //     setTransactions(prevTransactions => [
  //       { type: 'Purchase', amount, date: new Date().toISOString().split('T')[0] },
  //       ...prevTransactions
  //     ]);
  //     setPurchaseAmount('');
  //   }
  // };

  // const handleWithdraw = () => {
  //   const amount = parseInt(withdrawAmount);
  //   if (!isNaN(amount) && amount > 0 && amount <= totalTokens) {
  //     setTotalTokens(prevTokens => prevTokens - amount);
  //     setTransactions(prevTransactions => [
  //       { type: 'Withdraw', amount, date: new Date().toISOString().split('T')[0] },
  //       ...prevTransactions
  //     ]);
  //     setWithdrawAmount('');
  //   }
  // };
  

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold mb-8 sm:mb-12 text-center">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#550EFB] to-[#360C99]">
            Token Management
          </span>
        </h1>

        <div className="grid gap-8">
          {/* Total Tokens Display */}
          <section className="bg-gradient-to-br from-[#360C99] to-[#550EFB] rounded-2xl p-6 sm:p-8 shadow-lg">
            <div className="bg-black bg-opacity-30 rounded-xl p-6 sm:p-8 flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold mb-2 ">Total Tokens</h2>
                <p className="text-4xl sm:text-5xl font-bold">{result.data?.formatted}</p>
              </div>
              <Coins className="w-16 h-16 sm:w-24 sm:h-24 text-[#550EFB] opacity-50" />
            </div>
          </section>
          <section className="bg-gradient-to-br from-[#360C99] to-[#550EFB] rounded-2xl p-6 sm:p-8 shadow-lg">
            <div className="bg-black bg-opacity-30 rounded-xl p-6 sm:p-8 flex items-center justify-center">
              <div className='flex items-center justify-center flex-col gap-5'>
                <h2 className="text-xl sm:text-2xl font-semibold mb-2 ">Faucet for Rohr Tokens</h2>
                <button className='text-xl bg-[#0346FF] shadow-xl px-4 py-2 rounded-xl' onClick={()=>{
                  writeContract({
                    address: "0xa4469D636e79FA46C4E1d320c96E647db59E5a36",
                    abi:tokenABI,
                    functionName: "mint",
                  })
                }}>Get Tokens</button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TokenManagementPage;
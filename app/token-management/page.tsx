"use client"
import React, { useState } from 'react';
import { Coins, ShoppingCart, CreditCard, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const TokenManagementPage = () => {
  const [totalTokens, setTotalTokens] = useState(1000);
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [transactions, setTransactions] = useState([
    { type: 'Purchase', amount: 500, date: '2024-09-01' },
    { type: 'Withdraw', amount: 200, date: '2024-08-28' },
    { type: 'Purchase', amount: 1000, date: '2024-08-25' },
  ]);

  const handlePurchase = () => {
    const amount = parseInt(purchaseAmount);
    if (!isNaN(amount) && amount > 0) {
      setTotalTokens(prevTokens => prevTokens + amount);
      setTransactions(prevTransactions => [
        { type: 'Purchase', amount, date: new Date().toISOString().split('T')[0] },
        ...prevTransactions
      ]);
      setPurchaseAmount('');
    }
  };

  const handleWithdraw = () => {
    const amount = parseInt(withdrawAmount);
    if (!isNaN(amount) && amount > 0 && amount <= totalTokens) {
      setTotalTokens(prevTokens => prevTokens - amount);
      setTransactions(prevTransactions => [
        { type: 'Withdraw', amount, date: new Date().toISOString().split('T')[0] },
        ...prevTransactions
      ]);
      setWithdrawAmount('');
    }
  };

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
                <p className="text-4xl sm:text-5xl font-bold">{totalTokens}</p>
              </div>
              <Coins className="w-16 h-16 sm:w-24 sm:h-24 text-[#550EFB] opacity-50" />
            </div>
          </section>

          {/* Token Management Form */}
          <section className="bg-gradient-to-br from-[#360C99] to-[#550EFB] rounded-2xl p-6 sm:p-8 shadow-lg">
            <h2 className="text-xl sm:text-2xl font-semibold mb-6">Manage Your Tokens</h2>
            
            <div className="flex flex-col space-y-6 sm:space-y-8">
              {/* Purchase Tokens */}
              <div className="bg-black bg-opacity-30 rounded-xl p-4 sm:p-6">
                
                <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center">
                  <ShoppingCart className="mr-2 text-[#550EFB]" /> Purchase Tokens
                </h3>
                <div className=" space-y-2 sm:space-y-0 sm:space-x-4">
                <div
          id="swap-box"
          className="bg-black opacity-50 w-full py-10 px-4 lg:px-10 flex flex-col gap-4 h-full rounded-xl "
        >
          <div className="flex justify-between w-full text-white">
            <span>Swap</span>
            <span>Available 0.0 Eth</span>
          </div>
          <div className="w-full flex items-center  border border-white rounded-lg h-[95%]">
            <div className="border-r border-white h-full  flex items-start py-2 justify-start w-[50%] md:w-[30%] cursor-pointer" >
              <div className="w-full h-full flex justify-between px-4 items-center text-white gap-8 lg:gap-0">
                <div className="flex gap-2 items-center" >
                  
                  <span>Eth</span>
                </div>
              </div>
            </div>
            <input
              type="text"
              value={"0.0"}
              className="bg-transparent px-4 select-none border-none outline-none text-slate-100"
            />
          </div>
         
          <div className='flex items-center justify-center w-full gap-2'>
              <hr className='w-[50%] border  border-[#121B2C] border-1'/>
              <div className=" h-fit">
                {/* <Image
                  src="/Images/swap.png"
                  width={25}
                  height={25}
                  alt="swap"
                  className="rounded-sm my-4 relative"
                /> */}
              </div>
              <hr  className='w-[50%] border  border-[#121B2C]'/>
          </div>

          <div className="flex justify-between w-full text-white">
            <span>For</span>
            <span>Available 0.0 Rohr</span>
          </div>
          <div className="w-full flex items-center  border border-white rounded-lg h-[95%]">
            <div className="border-r border-white h-full  flex items-start py-2 justify-start w-[50%] md:w-[30%] cursor-pointer" >
              <div className="w-full  h-full flex justify-between px-4 items-center text-white gap-10 md:gap-0">
                <div className="flex gap-2 items-center">
                  {/* <Image
                    src={${tokens.filter((p)=>p.name===toToken).map((e)=>e.image)}}
                    width={25}
                    height={25}
                    alt={"velo"}
                    className='rounded-full'
                  /> */}
                  <span>Rohr</span>
                </div>
              </div>
            </div>
            <input
              type="text"
              value={"0.0"}
              className="bg-transparent select-none px-4 border-none outline-none text-slate-100"
            />
          </div>
                </div>
                </div>
                <Button className='w-full bg-[#1c0354] hover:bg-[#170a35] transition-colors duration-300 mt-8'>Swap</Button>
              </div>

              {/* Withdraw Tokens */}
              <div className="bg-black bg-opacity-30 rounded-xl p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center">
                  <CreditCard className="mr-2 text-[#550EFB]" /> Withdraw Tokens
                </h3>
                <div className=" space-y-2 sm:space-y-0 sm:space-x-4">
                <div
          id="swap-box"
          className="bg-black opacity-50 w-full py-10 px-4 lg:px-10 flex flex-col gap-4 h-full rounded-xl "
        >
          <div className="flex justify-between w-full text-white">
            <span>Swap</span>
            <span>Available 0.0 Rohr</span>
          </div>
          <div className="w-full flex items-center  border border-white rounded-lg h-[95%]">
            <div className="border-r border-white h-full  flex items-start py-2 justify-start w-[50%] md:w-[30%] cursor-pointer" >
              <div className="w-full h-full flex justify-between px-4 items-center text-white gap-8 lg:gap-0">
                <div className="flex gap-2 items-center" >
                  
                  <span>Rohr</span>
                </div>
              </div>
            </div>
            <input
              type="text"
              value={"0.0"}
              className="bg-transparent px-4 select-none border-none outline-none text-slate-100"
            />
          </div>
         
          <div className='flex items-center justify-center w-full gap-2'>
              <hr className='w-[50%] border  border-[#121B2C] border-1'/>
              <div className=" h-fit">
                {/* <Image
                  src="/Images/swap.png"
                  width={25}
                  height={25}
                  alt="swap"
                  className="rounded-sm my-4 relative"
                /> */}
              </div>
              <hr  className='w-[50%] border  border-[#121B2C]'/>
          </div>

          <div className="flex justify-between w-full text-white">
            <span>For</span>
            <span>Available 0.0 Eth</span>
          </div>
          <div className="w-full flex items-center  border border-white rounded-lg h-[95%]">
            <div className="border-r border-white h-full  flex items-start py-2 justify-start w-[50%] md:w-[30%] cursor-pointer" >
              <div className="w-full  h-full flex justify-between px-4 items-center text-white gap-10 md:gap-0">
                <div className="flex gap-2 items-center">
                  {/* <Image
                    src={${tokens.filter((p)=>p.name===toToken).map((e)=>e.image)}}
                    width={25}
                    height={25}
                    alt={"velo"}
                    className='rounded-full'
                  /> */}
                  <span>Eth</span>
                </div>
              </div>
            </div>
            <input
              type="text"
              value={"0.0"}
              className="bg-transparent select-none px-4 border-none outline-none text-slate-100"
            />
          </div>
                </div>
                </div>
                <Button className='w-full bg-[#1c0354] hover:bg-[#170a35] transition-colors duration-300 mt-8'>Swap</Button>
              </div>
            </div>
          </section>

          {/* Transaction History */}
          <section className="bg-gradient-to-br from-[#360C99] to-[#550EFB] rounded-2xl p-6 sm:p-8 shadow-lg">
            <h2 className="text-xl sm:text-2xl font-semibold mb-6 flex items-center">
              <Clock className="mr-2 text-[#550EFB]" /> Transaction History
            </h2>
            <div className="bg-black bg-opacity-30 rounded-xl p-4 sm:p-6 overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-400">
                    <th className="pb-4 pr-4">Type</th>
                    <th className="pb-4 pr-4">Amount</th>
                    <th className="pb-4">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction, index) => (
                    <tr key={index} className="border-t border-gray-700">
                      <td className="py-4 pr-4">{transaction.type}</td>
                      <td className="py-4 pr-4">{transaction.amount}</td>
                      <td className="py-4">{transaction.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TokenManagementPage;
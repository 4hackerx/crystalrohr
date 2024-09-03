"use client"
import React, { useEffect } from 'react'
import { coreKitInstance } from './config'

const Initializer = () => {
    useEffect( ()=>{
        async function initilise(){
            await coreKitInstance.init();
        }
        initilise();
    },[])
  return (
    <></>
  )
}

export default Initializer
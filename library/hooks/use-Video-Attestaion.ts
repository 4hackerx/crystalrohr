import {
    SignProtocolClient,
    SpMode,
    EvmChains,
    delegateSignAttestation,
    delegateSignRevokeAttestation,
    delegateSignSchema,
    IndexService,
  } from '@ethsign/sp-sdk';
interface attestationData{
    originalVideoHash:string,
    captionVideoHash:string,
    nodeAssigned:string,
}
export const useVideoAttestation =async ()=>{
    const client = new SignProtocolClient(SpMode.OnChain,{
        chain:EvmChains.sepolia
    })

    const indexer = new IndexService("testnet");
    const schema = await indexer.querySchema("onchain_evm_11155111_0x15d")    

    async function createAttestation({originalVideoHash,captionVideoHash,nodeAssigned}:attestationData){
        const attestations = await client.createAttestation({
            schemaId:"onchain_evm_11155111_0x15d",
            data:{
                originalVideoHash,
                captionVideoHash,
                nodeAssigned
            },
            indexingValue:'xxx'
        })
        return attestations;
    }

    async function verifyAttestation(attestationId:string){
        const attestation = await indexer.queryAttestation(attestationId);
        if(!attestation){
            return "No attestations with this id";
        }
    }

    return{
        createAttestation,
        verifyAttestation
    }
}

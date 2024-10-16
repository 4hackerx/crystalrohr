import {
    EvmChains,
    IndexService,
    SignProtocolClient,
    SpMode
} from "@ethsign/sp-sdk";
interface attestationData {
  originalVideoHash: string;
  captionVideoHash: string;
  nodeAssigned: string;
}
export const useVideoAttestation = async () => {
  const client = new SignProtocolClient(SpMode.OnChain, {
    chain: EvmChains.sepolia,
  });

  const indexer = new IndexService("testnet");
  const schema = await indexer.querySchema("onchain_evm_11155111_0x15d");

  async function createAttestation({
    originalVideoHash,
    captionVideoHash,
    nodeAssigned,
  }: attestationData) {
    const attestations = await client.createAttestation({
      schemaId: "onchain_evm_11155111_0x15d",
      data: {
        originalVideoHash,
        captionVideoHash,
        nodeAssigned,
      },
      indexingValue: "xxx",
    });
    return attestations;
  }

  async function verifyAttestation(
    nodeAssigned: string,
    attestationId: string
  ) {
    const attestation = await indexer.queryAttestation(attestationId);
    if (!attestation) {
      return "No attestations with this id";
    }
    const { attester } = attestation;
    if (attester === nodeAssigned) {
      return "Attestation is valid";
    }
    return "Invalid Attestation";
  }

  return {
    createAttestation,
    verifyAttestation,
  };
};

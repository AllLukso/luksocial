const IPFS_GATEWAY = "https://2eff.lukso.dev/ipfs/";

export const ipfsUriToGatewayUrl = (uri: string): string => {
  return uri.replace("ipfs://", IPFS_GATEWAY);
};

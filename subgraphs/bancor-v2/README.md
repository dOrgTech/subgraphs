# Bancor v2 Subgraph
## Links

- Protocol: https://bancor.network/
- Analytics: https://dune.xyz/Bancor/bancor_1
- Docs: https://docs.bancor.network/
- Smart contracts: https://github.com/bancorprotocol/contracts-solidity
- Deployed addresses: https://docs.bancor.network/ethereum-contracts/addresses
- Official subgraph: https://thegraph.com/hosted-service/subgraph/blocklytics/bancor

## Build

- Generate code from manifest and schema: `yarn codegen`
- Build subgraph: `yarn build`

## Deploy

- Authenticate (just once): `graph auth --product hosted-service <ACCESS_TOKEN>`
- Deploy to Hosted Service: `graph init --product hosted-service cbrzn/bancor-v2-ropsten`

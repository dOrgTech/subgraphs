# Balancer v2 Subgraph
## Links

- Protocol: https://balancer.fi/
- Analytics: https://dune.xyz/balancerlabs
- Docs: https://docs.balancer.fi/
- Smart contracts: https://github.com/balancer-labs/balancer-v2-monorepo
- Deployed addresses: https://github.com/balancer-labs/balancer-v2-monorepo/tree/master/pkg/deployments#past-deployments
- Official subgraph: https://github.com/balancer-labs/balancer-subgraph-v2

## Build

- Generate code from manifest and schema: `yarn codegen`
- Build subgraph: `yarn build`

## Deploy

- Authenticate (just once): `graph auth --product hosted-service <ACCESS_TOKEN>`
- Deploy to Hosted Service: `graph init --product hosted-service cbrzn/balancer-v2`

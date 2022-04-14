import { Address, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { mockMethod } from "./helpers";
import { Token } from "../generated/schema";

/**
 * Pool URL: https://app.balancer.fi/#/pool/0x36128d5436d2d70cab39c9af9cce146c38554ff0000200000000000000000009
 */
export const gnoBalPoolId = Bytes.fromHexString("0x36128d5436d2d70cab39c9af9cce146c38554ff0000200000000000000000009");
export const gnoBalPoolAddress = Address.fromString("0x8e9aa87e45e92bad84d5f8dd1bff34fb92637de9");

mockMethod(gnoBalPoolAddress, "decimals", [], [], "uint8", [ethereum.Value.fromI32(18)], false);
mockMethod(gnoBalPoolAddress, "name", [], [], "string", [ethereum.Value.fromString("name")], false);
mockMethod(gnoBalPoolAddress, "symbol", [], [], "string", [ethereum.Value.fromString("symbol")], false);
mockMethod(gnoBalPoolAddress, "getSwapFeePercentage", [], [], "uint256", [ethereum.Value.fromI32(18)], false);
mockMethod(gnoBalPoolAddress, "getNormalizedWeights", [], [], "uint256[]", [], true);

export const gno = new Token("0x6810e776880C02933D47DB1b9fc05908e5386b96");

mockMethod(Address.fromString(gno.id), "decimals", [], [], "uint8", [ethereum.Value.fromI32(18)], false);
mockMethod(Address.fromString(gno.id), "name", [], [], "string", [ethereum.Value.fromString("name")], false);
mockMethod(Address.fromString(gno.id), "symbol", [], [], "string", [ethereum.Value.fromString("symbol")], false);

export const bal = new Token("0xba100000625a3754423978a60c9317c58a424e3D");

mockMethod(Address.fromString(bal.id), "decimals", [], [], "uint8", [ethereum.Value.fromI32(18)], false);
mockMethod(Address.fromString(bal.id), "name", [], [], "string", [ethereum.Value.fromString("name")], false);
mockMethod(Address.fromString(bal.id), "symbol", [], [], "string", [ethereum.Value.fromString("symbol")], false);

gno.save();
bal.save();

/**
 * Pool URL: https://app.balancer.fi/#/pool/0x96646936b91d6b9d7d0c47c496afbf3d6ec7b6f8000200000000000000000019
 */
export const usdcWethPoolId = Bytes.fromHexString("0x96646936b91d6b9d7d0c47c496afbf3d6ec7b6f8000200000000000000000019");
export const usdcWethPoolAddress = Address.fromString("0x96646936b91d6b9d7d0c47c496afbf3d6ec7b6f8");

mockMethod(usdcWethPoolAddress, "decimals", [], [], "uint8", [ethereum.Value.fromI32(18)], false);
mockMethod(usdcWethPoolAddress, "name", [], [], "string", [ethereum.Value.fromString("name")], false);
mockMethod(usdcWethPoolAddress, "symbol", [], [], "string", [ethereum.Value.fromString("symbol")], false);
mockMethod(usdcWethPoolAddress, "getSwapFeePercentage", [], [], "uint256", [ethereum.Value.fromI32(18)], false);
mockMethod(usdcWethPoolAddress, "getNormalizedWeights", [], [], "uint256[]", [], true);

export const weth = new Token("0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2");

mockMethod(Address.fromString(weth.id), "decimals", [], [], "uint8", [ethereum.Value.fromI32(18)], false);
mockMethod(Address.fromString(weth.id), "name", [], [], "string", [ethereum.Value.fromString("name")], false);
mockMethod(Address.fromString(weth.id), "symbol", [], [], "string", [ethereum.Value.fromString("symbol")], false);

export const usdc = new Token("0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48");

mockMethod(Address.fromString(usdc.id), "decimals", [], [], "uint8", [ethereum.Value.fromI32(18)], false);
mockMethod(Address.fromString(usdc.id), "name", [], [], "string", [ethereum.Value.fromString("name")], false);
mockMethod(Address.fromString(usdc.id), "symbol", [], [], "string", [ethereum.Value.fromString("symbol")], false);

weth.save();
usdc.save();
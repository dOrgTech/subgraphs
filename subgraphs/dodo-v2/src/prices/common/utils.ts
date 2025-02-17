import { ERC20 } from "../../../generated/DVMFactory/ERC20";
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";

export function readValue<T>(callResult: ethereum.CallResult<T>, defaultValue: T): T {
  return callResult.reverted ? defaultValue : callResult.value;
}

export function getTokenDecimals(tokenAddr: Address): BigInt {
  const token = ERC20.bind(tokenAddr);

  let decimalsCall = token.try_decimals();

  if (decimalsCall.reverted) {
    return BigInt.fromI32(18);
  }

  return BigInt.fromI32(decimalsCall.value);
}

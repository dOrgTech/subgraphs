// import { log } from "@graphprotocol/graph-ts"
import { Address, BigInt, ethereum, log } from "@graphprotocol/graph-ts";
import { bigIntToBigDecimal, calculateAverage, safeDiv } from "./numbers";

import {
  Token,
  _TokenPrice,
  DexAmmProtocol,
  LiquidityPool,
  UsageMetricsDailySnapshot,
  FinancialsDailySnapshot,
  PoolDailySnapshot,
  RewardToken,
  Deposit,
  Withdraw,
  Swap
} from "../../generated/schema";

import { fetchTokenSymbol, fetchTokenName, fetchTokenDecimals } from "./tokens";

import {
  ZERO_BD,
  ZERO_BI,
  ONE_BI,
  WRAPPED_ETH,
  Network,
  ProtocolType,
  RewardTokenType,
  SECONDS_PER_DAY,
  DODOLpToken_ADDRESS,
  vDODOToken_ADDRESS,
  DVMFactory_ADDRESS,
  CPFactory_ADDRESS,
  DPPFactory_ADDRESS,
  DSPFactory_ADDRESS,
  STABLE_COINS
} from "./constants";

import { Address, BigDecimal } from "@graphprotocol/graph-ts";

import { ERC20 } from "../../generated/CP/ERC20";

import { DVM } from "../../generated/DVM/DVM";
import { CP } from "../../generated/CP/CP";
import { DPP } from "../../generated/DPP/DPP";
import { DSP } from "../../generated/DSP/DSP";

export function getOrCreateRewardToken(rewardToken: Address): RewardToken {
  let token = RewardToken.load(rewardToken.toHexString());
  // fetch info if null
  if (!token) {
    token = new RewardToken(rewardToken.toHexString());
    token.symbol = fetchTokenSymbol(rewardToken);
    token.name = fetchTokenName(rewardToken);
    token.decimals = fetchTokenDecimals(rewardToken);
    token.type = RewardTokenType.DEPOSIT;
    token.save();
  }
  return token;
}

export function getOrCreateToken(tokenAddress: Address): Token {
  let token = Token.load(tokenAddress.toHexString());
  // fetch info if null
  if (!token) {
    token = new Token(tokenAddress.toHexString());
    token.symbol = fetchTokenSymbol(tokenAddress);
    token.name = fetchTokenName(tokenAddress);
    token.decimals = fetchTokenDecimals(tokenAddress);
    token.save();
  }
  return token;
}

export function getOrCreateDexAmm(factoryAddress: Address): DexAmmProtocol {
  let proto = getProtocolFromPool(factoryAddress);
  let protocol = DexAmmProtocol.load(proto);

  if (!protocol) {
    protocol = new DexAmmProtocol(proto);
    protocol.name = "DODO V2";
    protocol.slug = "messari-dodo";
    protocol.schemaVersion = "1.0.0";
    protocol.subgraphVersion = "1.0.0";
    protocol.methodologyVersion = "1.1.3";
    protocol.network = Network.ETHEREUM;
    protocol.type = ProtocolType.EXCHANGE;
    protocol.totalUniqueUsers = 0;
    protocol.totalValueLockedUSD = ZERO_BD;

    protocol.save();
  }
  return protocol;
}

export function getOrCreatePool(
  poolAddress: Address,
  baseAdd: Address,
  quoteAdd: Address,
  timestamp: BigInt,
  blockNumber: BigInt
): LiquidityPool {
  let dodo = getOrCreateDexAmm(poolAddress);
  let pool = LiquidityPool.load(poolAddress.toHex());
  let it = getOrCreateToken(baseAdd);
  let ot = getOrCreateToken(quoteAdd);
  let dodoLp = getOrCreateRewardToken(Address.fromString(DODOLpToken_ADDRESS));
  let vdodo = getOrCreateRewardToken(Address.fromString(vDODOToken_ADDRESS));
  let lpToken = getOrCreateToken(poolAddress);

  if (!pool) {
    pool = new LiquidityPool(poolAddress.toHex());
    pool.protocol = dodo.id;
    pool.inputTokens = [it.id, ot.id];
    pool.outputToken = lpToken.id;
    pool.rewardTokens = [dodoLp.id, vdodo.id];
    pool.totalValueLockedUSD = ZERO_BD;
    pool.totalVolumeUSD = ZERO_BD;
    pool.inputTokenBalances = [ZERO_BI, ZERO_BI];
    pool.outputTokenSupply = ZERO_BI;
    pool.outputTokenPriceUSD = ZERO_BD;
    pool.rewardTokenEmissionsAmount = [ZERO_BI];
    pool.rewardTokenEmissionsUSD = [ZERO_BD];
    pool.createdTimestamp = timestamp;
    pool.createdBlockNumber = blockNumber;
    pool.save();
  }
  return pool;
}

export function getOrCreateUsageMetricSnapshot(
  event: ethereum.Event
): UsageMetricsDailySnapshot {
  // Number of days since Unix epoch
  let id: i64 = event.block.timestamp.toI64() / SECONDS_PER_DAY;

  // Create unique id for the day
  let usageMetrics = UsageMetricsDailySnapshot.load(id.toString());

  if (!usageMetrics) {
    usageMetrics = new UsageMetricsDailySnapshot(id.toString());
    usageMetrics.protocol = getProtocolFromPool(event.address);

    usageMetrics.activeUsers = 0;
    usageMetrics.totalUniqueUsers = 0;
    usageMetrics.dailyTransactionCount = 0;
    usageMetrics.save();
  }

  return usageMetrics;
}

export function getOrCreateFinancials(
  event: ethereum.Event
): FinancialsDailySnapshot {
  // Number of days since Unix epoch
  let id: i64 = event.block.timestamp.toI64() / SECONDS_PER_DAY;

  let financialMetrics = FinancialsDailySnapshot.load(id.toString());

  if (!financialMetrics) {
    financialMetrics = new FinancialsDailySnapshot(id.toString());
    financialMetrics.protocol = getProtocolFromPool(event.address);
    financialMetrics.totalVolumeUSD = ZERO_BD;
    financialMetrics.totalValueLockedUSD = ZERO_BD;
    financialMetrics.supplySideRevenueUSD = ZERO_BD;
    financialMetrics.protocolSideRevenueUSD = ZERO_BD;
    financialMetrics.totalRevenueUSD = ZERO_BD;

    financialMetrics.save();
  }
  return financialMetrics;
}

export function getOrCreatePoolDailySnapshot(
  event: ethereum.Event
): PoolDailySnapshot {
  let id: i64 = event.block.timestamp.toI64() / SECONDS_PER_DAY;
  let poolAddress = event.address.toHexString();
  let poolMetrics = PoolDailySnapshot.load(
    poolAddress.concat("-").concat(id.toString())
  );

  if (!poolMetrics) {
    poolMetrics = new PoolDailySnapshot(
      poolAddress.concat("-").concat(id.toString())
    );

    poolMetrics.protocol = getProtocolFromPool(event.address);
    poolMetrics.pool = poolAddress;
    poolMetrics.rewardTokenEmissionsAmount = [];
    poolMetrics.rewardTokenEmissionsUSD = [];

    poolMetrics.save();
  }

  return poolMetrics;
}

function getProtocolFromPool(poolAddress: Address): string {
  let pool = DVM.bind(poolAddress);
  let callResult = pool.try_version();
  let version = "";

  if (callResult.reverted) {
    log.info("pool get version reverted", []);
  } else {
    version = callResult.value;
  }

  let factoryAdd = "";
  if (version == "DVM 1.0.2") {
    factoryAdd = DVMFactory_ADDRESS;
  } else if (version == "CP 1.0.0") {
    factoryAdd = CPFactory_ADDRESS;
  } else if (version == "DPP 1.0.0") {
    factoryAdd = DPPFactory_ADDRESS;
  } else if (version == "DSP 1.0.1") {
    factoryAdd = DSPFactory_ADDRESS;
  }
  return factoryAdd;
}

export function getUSDprice(
  trader: Address,
  tokenAddress: Address,
  amount: BigInt
): BigDecimal {
  let total = ZERO_BD;

  let sc1 = STABLE_COINS[0];
  let sc2 = STABLE_COINS[1];
  let sc3 = STABLE_COINS[2];

  let divisionCounter = 0;

  log.info("address of token whos price is being checked: {} ", [
    tokenAddress.toHexString()
  ]);
  // let scAdd = STABLE_COINS[i];
  // for whatever reason trying to access the stablecoins array
  // from within a for loop causes a weird nondescript array error
  let tokenPrice1 = _TokenPrice.load(tokenAddress.toHexString() + sc1);
  if (!tokenPrice1) {
    tokenPrice1 = new _TokenPrice(tokenAddress.toHexString() + sc1);
    let token = getOrCreateToken(tokenAddress);
    tokenPrice1.token = token.id;
  }
  if (tokenPrice1.currentUSDprice > BigDecimal.fromString("0")) {
    total = tokenPrice1.currentUSDprice;
    divisionCounter++;
  }

  let tokenPrice2 = _TokenPrice.load(tokenAddress.toHexString() + sc2);
  if (!tokenPrice2) {
    tokenPrice2 = new _TokenPrice(tokenAddress.toHexString() + sc2);
    let token = getOrCreateToken(tokenAddress);
    tokenPrice2.token = token.id;
  }

  if (tokenPrice2.currentUSDprice > BigDecimal.fromString("0")) {
    total = total + tokenPrice2.currentUSDprice;
    divisionCounter++;
  }

  let tokenPrice3 = _TokenPrice.load(tokenAddress.toHexString() + sc3);
  if (!tokenPrice3) {
    tokenPrice3 = new _TokenPrice(tokenAddress.toHexString() + sc3);
    let token = getOrCreateToken(tokenAddress);
    tokenPrice3.token = token.id;
  }
  if (tokenPrice3.currentUSDprice > BigDecimal.fromString("0")) {
    total = total + tokenPrice3.currentUSDprice;
    divisionCounter++;
  }
  if (total == ZERO_BD) {
    return ZERO_BD;
  }
  let price = safeDiv(total, BigDecimal.fromString(divisionCounter.toString()));

  return price;
}

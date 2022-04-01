// import { log } from "@graphprotocol/graph-ts"
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import {
  Token,
  DexAmmProtocol,
  LiquidityPool,
  UsageMetricsDailySnapshot,
  FinancialsDailySnapshot,
  PoolDailySnapshot,
  RewardToken
} from "../../generated/schema";

import { fetchTokenSymbol, fetchTokenName, fetchTokenDecimals } from "./tokens";

import {
  ZERO_BD,
  Network,
  ProtocolType,
  RewardTokenType,
  SECONDS_PER_DAY,
  DVMFactory_ADDRESS,
  CPFactory_ADDRESS,
  DPPFactory_ADDRESS,
  DSPFactory_ADDRESS
} from "./constants";

import { DVM } from "../../generated/DVM/DVM";

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
  let protocol = DexAmmProtocol.load(factoryAddress.toHex());

  if (!protocol) {
    protocol = new DexAmmProtocol(factoryAddress.toHex());
    protocol.name = "DODO V2";
    protocol.slug = "messari-dodo";
    protocol.schemaVersion = "1.0.0";
    protocol.subgraphVersion = "1.0.0";
    protocol.network = Network.ETHEREUM;
    protocol.type = ProtocolType.EXCHANGE;
    protocol.totalUniqueUsers = 0;
    protocol.totalValueLockedUSD = ZERO_BD;

    protocol.save();
  }
  return protocol;
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

    financialMetrics.feesUSD = ZERO_BD;
    financialMetrics.totalVolumeUSD = ZERO_BD;
    financialMetrics.totalValueLockedUSD = ZERO_BD;
    financialMetrics.supplySideRevenueUSD = ZERO_BD;
    financialMetrics.protocolSideRevenueUSD = ZERO_BD;

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
  let version = pool.version();
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

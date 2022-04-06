import {Address, ethereum} from "@graphprotocol/graph-ts";
import {getOrCreateDex, getOrCreateFinancials, getOrCreateUsageMetricSnapshot} from "./getters";
import {SECONDS_PER_DAY} from "./constants";
import {_Account, _DailyActiveAccount} from "../../generated/schema";

export function updateFinancials(event: ethereum.Event): void {
    let financialMetrics = getOrCreateFinancials(event)
    financialMetrics.blockNumber = event.block.number;
    financialMetrics.timestamp = event.block.timestamp;

    financialMetrics.save();
}

export function updateUsageMetrics(event: ethereum.Event, from: Address): void {
    // Number of days since Unix epoch
    let id: i64 = event.block.timestamp.toI64() / SECONDS_PER_DAY;
    let usageMetrics = getOrCreateUsageMetricSnapshot(event);

    // Update the block number and timestamp to that of the last transaction of that day
    usageMetrics.blockNumber = event.block.number;
    usageMetrics.timestamp = event.block.timestamp;
    usageMetrics.dailyTransactionCount += 1;

    let accountId = from.toHexString();
    let account = _Account.load(accountId);
    let protocol = getOrCreateDex();
    if (!account) {
        account = new _Account(accountId);
        account.save();

        protocol.totalUniqueUsers += 1;
        protocol.save();
    }
    usageMetrics.totalUniqueUsers = protocol.totalUniqueUsers;

    // Combine the id and the user address to generate a unique user id for the day
    let dailyActiveAccountId = id.toString() + "-" + from.toHexString();
    let dailyActiveAccount = _DailyActiveAccount.load(dailyActiveAccountId);
    if (!dailyActiveAccount) {
        dailyActiveAccount = new _DailyActiveAccount(dailyActiveAccountId);
        dailyActiveAccount.save();
        usageMetrics.activeUsers += 1;
    }

    usageMetrics.save();
}
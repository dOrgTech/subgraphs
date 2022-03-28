import { NewIssuance } from "../../generated/schema"
import { Issuance } from "../../generated/DSToken/DSToken";

// Generate the deposit entity and update deposit account for the according pool.
export function createIssuance(event: Issuance): void {
  let issuance = new NewIssuance(event.transaction.hash.toHexString().concat("-").concat(event.logIndex.toString()));
  issuance.amount = event.params._amount;
  issuance.save();
}


import {
  createIssuance
} from "./helpers";
import { Issuance } from "../../generated/DSToken/DSToken"

// To improve readability and consistency, it is recommended that you put all
// handlers in this file, and create helper functions to handle specific events

export function handleIssuance(issuance: Issuance): void {
  createIssuance(issuance);
}
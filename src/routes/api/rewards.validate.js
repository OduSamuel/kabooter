import validator from "validator";

import {
  validateInteger,
  Required,
  RequestError,
  NoDataReceived
} from "../../utils/ValidationErrors";
import { isArray } from "../../utils";

export function validateRewardProps(payload, updating = false) {
  if (!payload) throw new NoDataReceived();
  if (updating) {
    validateInteger(payload.id, "id");
    payload.id = +payload.id;
  }
  if (!payload.name) throw new Required("name");
  if (!payload.points) throw new Required("points");
  if (!payload.quantity) throw new Required("quantity");
  if (!payload.expiry_date) throw new Required("expiry_date");
}

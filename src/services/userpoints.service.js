import { BaseEntityService } from "./baseentity.service";

export default class UserPointService extends BaseEntityService {
  constructor() {
    super("userpoints");
    log.setNamespace("UserPointService");
  }

  async getByName(name) {
    return await this.connector
      .table(this.tableName)
      .where({ name: name })
      .first();
  }
}

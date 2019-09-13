import { BaseEntityService } from "./baseentity.service";
import log from "../utils/log";

export default class UserPointService extends BaseEntityService {
  constructor() {
    super("userpoints");
    log.setNamespace("UserPointService");
  }

  async getByUserId(userId) {
    return await this.connector
      .table(this.tableName)
      .where({ userId: userId })
      .first();
  }

  async updateScore(gameScore, userId, requestData) {
    let exist;
    exist = await this.getFirst({ userId: userId });
    if(!exist) {
      const score = {
        userId: userId,
        totalEarned: gameScore,
        totalRedeemed: 0,
        availablePoints: gameScore
      };
      const res = await this.save(score, requestData);
      return { id: res };
    }
    else {
      exist.totalEarned += gameScore;
      exist.availablePoints += gameScore;
      await super.update(exist, requestData);
      return { id: exist.id };
    }
  }
}

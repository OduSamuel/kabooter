import { BaseEntityService } from "./baseentity.service";
import { UserPointService } from ".";
import Enums from "./enums";
import log from "../utils/log";
import { RequestError } from "../utils/ValidationErrors";
import { EventType } from "./AuditLogListener";
import moment from "moment";

export default class RewardService extends BaseEntityService {
  constructor() {
    super("rewards");
    log.setNamespace("RewardService");
  }

  /**
   *
   * @param {*} queryParams Example: {name: '', page: 1, perPage: 10 }
   */
  async getRecordsPaged(queryParams) {
    const query = this.connector
      .table(this.tableName + " as q")
      .modify(queryBuilder => {
        if (queryParams.title) {
          queryBuilder.where("q.name", "like", `%${queryParams.name}%`);
        }
      })
      .select([
        "q.id",
        "q.name",
        "q.availableQuantity",
        "q.requiredPoints",
        "q.expiry_date",
        "q.icon_url",
        "q.created_at"
      ]);
    return await this.dbPaging(query, { page: queryParams.page, perPage: queryParams.perPage });
  }

  async getPlayerRewards(userId) {
    const points = await new UserPointService().getByUserId(userId);
    const query = `
    select * from rewards where requiredPoints <= ? and expiry_date >= ?`;
    return await this.runSqlSelectQuery(query, [points.availablePoints, moment(new Date()).format("YYYY-MM-DD")]);
  }

  async deleteRecord(id, requestObject) {
    await super.deleteRecord(id, requestObject);
  }

  /**
   * Create quiz and return the id or the newly-created record.
   * @param {*} requestObject
   */
  async create(requestObject) {
    const payload = requestObject.body;
    const existing = await this.getFirst({ name: payload.name });
    if (existing) throw new RequestError(`A reward with the name ${payload.name} already exists`);

    const reward = {
      name: payload.name,
      availableQuantity: payload.quantity,
      requiredPoints: payload.points,
      expiry_date: moment(payload.expiry_date).format('YYYY-MM-DD')
    };
    const res = await this.save(reward, requestObject);
    return { id: res }; // the id of the newly saved record
  }

  async update(requestObject) {
    const payload = requestObject.body;
    const existing = await this.getFirst({ name: payload.name });
    if (existing && existing.id !== payload.id) {
      log.debug("Running rewardservice.update. payload = %o", payload);
      log.debug("Running rewardservice.update. existing = %o", existing);
      throw new RequestError(`A quiz with the title ${payload.name} already exists`);
    }
    const reward = {
      id: payload.id,
      name: payload.name,
      availableQuantity: payload.quantity,
      requiredPoints: payload.points,
      expiry_date: moment(payload.expiry_date).format('YYYY-MM-DD')
    };
    await super.update(reward, requestObject);
    return { id: reward.id };
  }
}
import { BaseEntityService } from "./baseentity.service";
import { UserPointService, RewardService, UserService } from ".";
import Enums from "./enums";
import log from "../utils/log";
import { RequestError } from "../utils/ValidationErrors";
import { EventType } from "./AuditLogListener";
import Emailer from "./Emailer";
import moment from "moment";

export default class RewardClaimService extends BaseEntityService {
  constructor() {
    super("rewardclaims");
    log.setNamespace("RewardClaimService");
  }

  /**
   *
   * @param {*} queryParams Example: {name: '', page: 1, perPage: 10 }
   */
  async getRecordsPaged(queryParams) {
    const query = this.connector
      .table(this.tableName + " as c")
      .join('users as u', 'c.userId', '=', 'u.id')
      .join('rewards as r', 'c.rewardId', '=', 'r.id')
      .modify(queryBuilder => {
        queryBuilder.whereNot('c.fulfilled', true);
        queryBuilder.where('c.rejected', false);
        if (queryParams.name) {
          queryBuilder.where("u.firstname", "like", `%${queryParams.name}%`)
          .orWhere("u.lastname", "like", `%${queryParams.name}%`)
          .orWhere("r.name", "like", `%${queryParams.name}%`);
        }
      })
      .select([
        "c.id",
        "c.userId",
        "c.rewardId",
        "c.fulfilled",
        "c.approved",
        "c.rejected",
        "c.updated_at",
        "u.username",
        "u.firstname",
        "u.lastname",
        "r.name",
        "r.requiredPoints"
      ]);
    return await this.dbPaging(query, { page: queryParams.page, perPage: queryParams.perPage });
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
    const reward = await new RewardService().getById(payload.rewardId);
    const points = await new UserPointService().getByUserId(requestObject.user.id);
    if (!reward) throw new RequestError(`The reward does not exist`);
    if(reward.availableQuantity < 1) {
        throw new RequestError(`There are no more rewards to claim`);
    }
    if(points.availablePoints < reward.requiredPoints) {
        throw new RequestError(`Available points less than reward points required.`);
    }
    reward.availableQuantity -= 1;
    points.availablePoints -= reward.requiredPoints;
    points.totalRedeemed += reward.requiredPoints;

    const rewardclaim = {
      userId: requestObject.user.id,
      rewardId: payload.rewardId,
      fulfilled: false,
      approved: false
    };
    new RewardService().internalModify(reward, requestObject);
    new UserPointService().update(points, requestObject);
    const res = await this.save(rewardclaim, requestObject);
    return { id: res }; // the id of the newly saved record
  }

  async approve(id, requestObject){
    const existing = await this.getFirst({ id: id });
    if(!existing) {
        throw new RequestError(`Reward claim does not exist`);
    }
    existing.approved = true;
    await super.update(existing, requestObject);
    //send mail here
    const user = await new UserService().getById(requestObject.user.id);
    const reward = await new RewardService().getById(existing.rewardId);
    const viewData = {
      title: `${process.env.APP_NAME}: Your reward has been approved.`,
      firstname: user.firstname,
      lastname: user.lastname,
      username: user.username,
      reward: reward.name
    };
    const options = { to: user.email, subject: viewData.title };
    new Emailer().sendEmail(options, `reward-approved.html`, viewData);
    return { id: id };
  }

  async reject(id, requestObject){
    const existing = await this.getFirst({ id: id });
    if(!existing) {
        throw new RequestError(`Reward claim does not exist`);
    }
    const points = await new UserPointService().getByUserId(existing.userId);
    const reward = await new RewardService().getById(existing.rewardId);
    if (!reward) throw new RequestError(`The reward does not exist`);
    if (!points) throw new RequestError(`User points does not exist`);

    reward.availableQuantity += 1;
    points.availablePoints += reward.requiredPoints;
    points.totalRedeemed -= reward.requiredPoints;
    existing.rejected = true;
    new RewardService().internalModify(reward, requestObject);
    new UserPointService().update(points, requestObject);
    await super.update(existing, requestObject);

    //send mail here
    const user = await new UserService().getById(requestObject.user.id);
    const viewData = {
      title: `${process.env.APP_NAME}: Your reward has been rejected.`,
      firstname: user.firstname,
      lastname: user.lastname,
      username: user.username,
      reward: reward.name
    };
    const options = { to: user.email, subject: viewData.title };
    new Emailer().sendEmail(options, `reward-rejected.html`, viewData);
    return { id: id };
  }

  async fulfill(id, requestObject){
    const existing = await this.getFirst({ id: id });
    if(!existing) {
        throw new RequestError(`Reward claim does not exist`);
    }
    existing.fulfilled = true;
    await super.update(existing, requestObject);
    return { id: id };
  }
}
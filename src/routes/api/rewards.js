import Router from "koa-router";
import { RewardService } from "../../services";
import { validateRewardProps } from "./rewards.validate";
import { validateInteger, RequestError } from "../../utils/ValidationErrors";

const router = new Router({ prefix: "/api/user/rewards" });

router.post("/create", async ctx => {
  try {
    validateRewardProps(ctx.request.body);

    const res = await new RewardService().create(ctx.request);
    ctx.body = res;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

router.post("/update", async ctx => {
  try {
    validateRewardProps(ctx.request.body, true);

    const res = await new RewardService().update(ctx.request);
    ctx.body = res;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

router.post("/delete/:id", async ctx => {
  try {
    validateInteger(ctx.params.id, "id");
    const res = await new RewardService().deleteRecord(ctx.params.id, ctx.request);
    ctx.body = res;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

router.get("/", async ctx => {
  try {
    const res = await new RewardService().getRecordsPaged(ctx.request.query);
    ctx.body = res;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

router.get("/:id", async ctx => {
  try {
    validateInteger(ctx.params.id, "id", true);
    const res = await new RewardService().getBy({ id: ctx.params.id });
    ctx.body = res[0];
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

// console.log(router.stack.map(i => i));
// Don't change this to ES6 style. We use 'require' to auto-register routes
// See src/app.js
module.exports = router;

import Router from "koa-router";
import { RewardClaimService } from "../../services";
import { validateInteger, RequestError } from "../../utils/ValidationErrors";

const router = new Router({ prefix: "/api/user/rewardclaims" });

router.post("/create", async ctx => {
    try {
        const res = await new RewardClaimService().create(ctx.request);
        ctx.body = res;
    } catch (e) {
        ctx.throw(e.status || 500, e);
    }
});

router.post("/approve/:id", async ctx => {
    try {
        validateInteger(ctx.params.id, "id");
        const res = await new RewardClaimService().approve(ctx.params.id, ctx.request);
        ctx.body = res;
    } catch (e) {
        ctx.throw(e.status || 500, e);
    }
});

router.post("/reject/:id", async ctx => {
    try {
        validateInteger(ctx.params.id, "id");
        const res = await new RewardClaimService().reject(ctx.params.id, ctx.request);
        ctx.body = res;
    } catch (e) {
        ctx.throw(e.status || 500, e);
    }
});

router.post("/fulfill/:id", async ctx => {
    try {
        validateInteger(ctx.params.id, "id");
        const res = await new RewardClaimService().fulfill(ctx.params.id, ctx.request);
        ctx.body = res;
    } catch (e) {
        ctx.throw(e.status || 500, e);
    }
});

router.post("/delete/:id", async ctx => {
    try {
        validateInteger(ctx.params.id, "id");
        const res = await new RewardClaimService().deleteRecord(ctx.params.id, ctx.request);
        ctx.body = res;
    } catch (e) {
        ctx.throw(e.status || 500, e);
    }
});

router.get("/", async ctx => {
    try {
        const res = await new RewardClaimService().getRecordsPaged(ctx.request.query);
        ctx.body = res;
    } catch (e) {
        ctx.throw(e.status || 500, e);
    }
});

router.get("/:id", async ctx => {
    try {
        validateInteger(ctx.params.id, "id", true);
        const res = await new RewardClaimService().getBy({ id: ctx.params.id });
        ctx.body = res[0];
    } catch (e) {
        ctx.throw(e.status || 500, e);
    }
});

// console.log(router.stack.map(i => i));
// Don't change this to ES6 style. We use 'require' to auto-register routes
// See src/app.js
module.exports = router;

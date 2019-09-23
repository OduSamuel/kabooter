
export async function up(knex) {
    return await knex.schema
        .table("rewardclaims", t => {
            t.boolean("rejected").defaultTo(false);
        });
}

export async function down(knex) {

}

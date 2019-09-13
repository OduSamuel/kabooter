export async function up(knex) {
    return await knex.schema
      .table("rewardclaims", t => {
        t.boolean("approved").defaultTo(false);
      })
      .table("userpoints", t => {
        t.integer("userId")
        .unsigned()
        .references("id")
        .inTable("users")
        .notNull();
      });
  }
  
  export async function down(knex) {
    return await knex.schema
      .table("rewardclaims", t => {
        t.dropColumn("approved");
      })
      .table("userpoints", t => {
        t.dropColumn("userId");
      });
  }
  
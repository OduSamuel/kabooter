export async function up(knex) {
    return await knex.schema.createTable('rewards', (t) => {
        t.increments();
        t.integer('availableQuantity');
        t.integer('requiredPoints');
        t.string('icon_url');
        t.time('expiry_date');
        t.timestamps(true, true);
      })
      .createTable('rewardclaims', (t) => {
        t.increments();
        t.integer("userId")
        .unsigned()
        .references("id")
        .inTable("users")
        .notNull();
        t.integer("rewardId")
        .unsigned()
        .references("id")
        .inTable("rewards")
        .notNull();
        t.boolean("fulfilled").defaultTo(false);
        t.timestamps(true, true);
      })
      .createTable('userpoints', (t) => {
        t.increments();
        t.integer('quizPoints');
        t.integer('surveyPoints');
        t.integer('totalEarned');
        t.integer('totalRedeemed');
        t.integer('availablePoints');
        t.timestamps(true, true);
      })
      .createTable("privileges", t => {
        t.increments(); //id: unsigned, primary
        t.timestamps(true, true); // created_at, updated_at
        t.string("name").notNull();
      })
      .createTable('role_privilege', (t) => {
        t.increments();
        t.integer("roleId")
        .unsigned()
        .references("id")
        .inTable("userroles")
        .notNull();
        t.integer("privilegeId")
        .unsigned()
        .references("id")
        .inTable("privileges")
        .notNull();
        t.timestamps(true, true);
      });
};

export async function down(knex) {
    return await knex.schema
    .dropTable("rewards")
    .dropTable("rewardclaims")
    .dropTable("userpoints")
    .dropTable("privileges")
    .dropTable("role_privilege");
};

export async function up(knex) {
    return await knex.schema
        .table("userpoints", t => {
            t.dropColumn("quizPoints");
            t.dropColumn("surveyPoints");
        });
}

export async function down(knex) {

}
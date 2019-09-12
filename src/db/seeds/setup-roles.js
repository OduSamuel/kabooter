
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('userroles').del()
    .then(function () {
      // Inserts seed entries
      return knex('userroles').insert([
        { id: 1, name: "Players"},
        { id: 2, name: "Moderator"},
        { id: 3, name: "SuperAdmin"}
      ]);
    });
};

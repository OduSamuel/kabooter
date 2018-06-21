import { getRoutesRequiringAuthorization } from "../../routes";
import Enums from "../../services/enums";
import { hashSync, genSaltSync } from "bcrypt";

export async function seed(knex) {
  // Deletes ALL existing entries
  await knex("quizquestions").del();
  await knex("quizzes").del();
  await knex("users").del();
  await knex("emailaccounts").del();
  await knex("permissions").del();
  await knex("userroles").del();

  await knex("emailaccounts").insert([
    {
      id: 1,
      name: "GMail Account",
      smtpHost: "smtp.gmail.com",
      smtpUsername: "",
      smtpPassword: "",
      smtpPort: 587,
      isDefault: true,
      secureSsl: true,
      useDefaultCredentials: false
    }
  ]);

  const pr = getRoutesRequiringAuthorization();
  const prKnex = [];
  pr.forEach((p, i) => {
    if (p.indexOf("/api/") > -1) {
      prKnex.push({ name: p });
    }
  });
  prKnex.map((p, i) => (p.id = i + 1));
  await knex("permissions").insert(prKnex);

  const pids = prKnex.map(p => p.id);
  await knex("userroles").insert([{ id: 1, name: "Super Admin", permissionIds: pids.join(",") }]);

  // Inserts seed entries
  await knex("users").insert([
    {
      id: 1,
      lastname: "Trump",
      firstname: "Donald",
      username: "djt",
      email: "trump@gmail.com",
      organization: "",
      passwordHash: hashSync("donald", genSaltSync()),
      roles: "1"
    },
    {
      id: 2,
      lastname: "Cruz",
      firstname: "Ted",
      username: "trc",
      email: "cruz@gmail.com",
      passwordHash: hashSync("ted", genSaltSync()),
      organization: ""
    },
    {
      id: 3,
      lastname: "Rubio",
      firstname: "Marco",
      username: "mkr",
      email: "rubio@gmail.com",
      passwordHash: hashSync("rubio", genSaltSync()),
      organization: ""
    }
  ]);

  // Add Quizzes
  await knex("quizzes").insert([
    {
      id: 1,
      title: "States in Nigeria",
      userId: 1,
      audience: Enums.Audience.School,
      visibleTo: Enums.VisibleTo.Everyone
    }
  ]);

  // Quiz questions
  await knex("quizquestions").insert([
    {
      id: 1,
      question: "What is Abia's slogan?",
      quizId: 1,
      timeLimit: 20,
      option1: "God's own state",
      option2: "Sunshine state",
      option3: "Food basket",
      option4: "Center for excellence",
      correctOptions: "1"
    },
    {
      id: 2,
      question: "What is Imo's slogan?",
      quizId: 1,
      timeLimit: 20,
      option1: "God's own state",
      option2: "Heartland",
      option3: "Food basket",
      option4: "Center for excellence",
      correctOptions: "2"
    },
    {
      id: 3,
      question: "What is Lagos' slogan?",
      quizId: 1,
      timeLimit: 20,
      option1: "God's own state",
      option2: "Heartland",
      option3: "Food basket",
      option4: "Center for excellence",
      correctOptions: "4"
    }
  ]);
}
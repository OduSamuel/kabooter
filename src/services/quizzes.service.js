import { BaseEntityService } from "./baseentity.service";
import { QuizQuestionService, QuizRunService } from "./";
import Enums from "./enums";
import log from "../utils/log";
import { RequestError } from "../utils/ValidationErrors";
export default class QuizService extends BaseEntityService {
  constructor() {
    super("quizzes");
    log.setNamespace("QuizService");
  }

  /**
   *
   * @param {*} queryParams Example: {title: '', userId: 0, page: 1, perPage: 10 }
   */
  async getRecordsPaged(queryParams) {
    const query = this.connector
      .table(this.tableName)
      .modify(queryBuilder => {
        if (queryParams.userId) {
          queryBuilder.where("userId", queryParams.userId);
        }
        if (queryParams.title) {
          queryBuilder.where("title", "like", `%${queryParams.title}%`);
        }
      })
      .select();

    return await this.dbPaging(query, { page: queryParams.page, perPage: queryParams.perPage });
  }

  async deleteRecord(id, requestData) {
    const hasRun = await new QuizRunService().hasQuizBeenRun(id);
    if (hasRun)
      throw new RequestError(
        "The quiz you want to delete has been played and the scores exist. You can no longer delete it."
      );

    //TODO: Put all these in one db transaction
    await new QuizQuestionService().deletePermanently({ quizId: id }, requestData);
    await super.deleteRecord(id, requestData);
  }

  /**
   * Create quiz and return the id or the newly-created record.
   * @param {*} userId
   * @param {*} payload
   */
  async create(userId, payload, requestData) {
    const existing = await this.getFirst({ title: payload.title });
    if (existing) throw new RequestError(`A quiz with the title ${payload.title} already exists`);

    const quiz = {
      title: payload.title,
      description: payload.description,
      audience: payload.audience || Enums.Audience.Social,
      introLink: payload.introLink,
      visibleTo: payload.visibleTo || Enums.VisibleTo.Everyone,
      creditResources: payload.creditResources,
      userId: userId
    };
    const res = await this.save(quiz, requestData);
    return { id: res }; // the id of the newly saved record
  }

  /**
   * Create survey and return the id or the newly-created record.
   * @param {*} requestData ctx.request
   */
  async createBatch(requestData) {
    const payload = requestData.body;
    const existing = await this.getFirst({ title: payload.title });
    if (existing) throw new RequestError(`A quiz with the title ${payload.title} already exists`);

    //TODO: Put this create thing in one db transaction
    const userId = requestData.user.id;
    const quiz = {
      title: payload.title,
      description: payload.description,
      audience: payload.audience || Enums.Audience.Social,
      introLink: payload.introLink,
      visibleTo: payload.visibleTo || Enums.VisibleTo.Everyone,
      creditResources: payload.creditResources,
      userId: userId
    };
    const quizId = await this.save(quiz, requestData);

    const questionList = [];
    if (payload.questions && payload.questions.length > 0) {
      try {
        payload.questions.forEach(q => {
          const qn = {
            question: q.question,
            timeLimit: q.timeLimit,
            quizId: quizId,
            option1: q.option1,
            option2: q.option2,
            option3: q.option3,
            option4: q.option4,
            correctOptions: q.correctOptions,
            points: q.points,
            maxBonus: q.maxBonus,
            introLink: q.introLink,
            creditResources: q.creditResources
          };
          questionList.push(qn);
        });

        await new QuizQuestionService().saveList(questionList, requestData);
      } catch (e) {
        log.error("Error creating quiz questiond. %o", e);
        throw new RequestError(
          `We SUCCESSFULLY created quiz with the title ${
            payload.title
          }. BUT we could not create the associated ${
            payload.questions.length
          } questions. Please add the questions manually.`
        );
      }
    }
    return { id: quizId, nQuestions: questionList.length }; // the id of the newly saved record
  }

  async update(payload, requestData) {
    const existing = await this.getFirst({ title: payload.title });
    if (existing && existing.id !== payload.id) {
      log.debug("Running quizservice.update. payload = %o", payload);
      log.debug("Running quizservice.update. existing = %o", existing);
      throw new RequestError(`A quiz with the title ${payload.title} already exists`);
    }
    const quiz = {
      id: payload.id,
      title: payload.title,
      description: payload.description,
      audience: payload.audience || Enums.Audience.Social,
      introLink: payload.introLink,
      visibleTo: payload.visibleTo || Enums.VisibleTo.Everyone,
      creditResources: payload.creditResources
    };
    await super.update(quiz, requestData);
    return { id: quiz.id };
  }

  async publish(id, requestData) {
    await super.update({ id: id, published: true }, requestData);
    return { id: id };
  }

  async unpublish(id, requestData) {
    await super.update({ id: id, published: false }, requestData);
    return { id: id };
  }

  /**
   * Returns the number of quizzes set up by the user with the given id
   * @param {*} userId
   */
  async getUserQuizCount(userId) {
    if (!userId) return null;

    return await this.getCount({ userId: userId });
  }

  async getByUserId(userId, doNotGetQuestions = false) {
    if (!userId) return null;

    return await this.getBy({ userId: userId }, doNotGetQuestions);
  }

  async getBy(equalityConditions, doNotGetQuestions = false) {
    if (!equalityConditions) return null;

    log.debug("Running quizservice.getBy with condition = %o", equalityConditions);
    const quizzes = await this.connector
      .table(this.tableName)
      .where(equalityConditions)
      .andWhereNot({ disabled: true })
      .select(
        "id",
        "title",
        "description",
        "audience",
        "visibleTo",
        "published",
        "userId",
        "introLink",
        "creditResources"
      );
    if (quizzes && quizzes.length > 0) {
      log.debug("quizzes from db");
      log.debug(quizzes);

      if (doNotGetQuestions) {
        return quizzes;
      }

      // Now we're getting questions
      const qIds = quizzes.map(q => q.id);
      const questions = await new QuizQuestionService().getByQuizIds(qIds);
      if (!questions) {
        return quizzes;
      }

      // Now there are questions
      const quizzesDict = {};
      quizzes.forEach(q => {
        quizzesDict[q.id] = q;
      });
      // const questionsByQuizId = questions.reduce(
      //   (entryMap, e) => entryMap.set(e.quizId, [...(entryMap.get(e.quizId) || []), e]),
      //   new Map()
      // );
      const questionsByQuizId = questions.reduce((entryMap, e) => {
        entryMap[e.quizId] = entryMap[e.quizId] || [];
        entryMap[e.quizId].push(e);
        return entryMap;
      }, Object.create(null));
      for (const qn in questionsByQuizId) {
        quizzesDict[qn].questions = questionsByQuizId[qn];
      }

      quizzes.length = 0; // clear the array
      for (const qn in quizzesDict) {
        quizzes.push(quizzesDict[qn]);
      }
      log.debug("quizzes with their questions");
      log.debug(quizzes);
      return quizzes;
    }

    return null;
  }
}

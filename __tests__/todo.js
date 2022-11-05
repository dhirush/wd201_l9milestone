const request = require("supertest");
const cheerio = require("cheerio");

const db = require("../models/index");
const app = require("../app");

let server, agent;

function extractCsrfToken(res) {
  var $ = cheerio.load(res.text);
  return $("[name=_csrf]").val();
}

describe("List the todo items", function () {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(3000, () => {});
    agent = request.agent(server);
  });

  afterAll(async () => {
    await db.sequelize.close();
    server.close();
  });

  test("create a todo", async () => {
    const res = await agent.get("/");
    const csrfToken = extractCsrfToken(res);
    console.log(res.text);
    const response = await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });
    expect(response.statusCode).toBe(302);
  });

  test("Mark a todo as complete", async () => {
    let res = await agent.get("/");
    let csrfToken = extractCsrfToken(res);

    const response = await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });

    const groupedTodosResponse = await agent.get("/");
    const parsedGroupedTodosResponse = JSON.parse(groupedTodosResponse);
    const dueTodayCount = groupedTodosResponse.length;
    const latestTodo = parsedGroupedTodosResponse[dueTodayCount - 1];

    res = await agent.get("/");
    csrfToken = extractCsrfToken(res);

    const markCompleteResponse = await agent
      .put(`/todos/${latestTodo.id}/markAsCompleted`)
      .send({
        _csrf: csrfToken,
      });

    const parsedUpdateResponse = JSON.parse(markCompleteResponse.text);
    expect(parsedUpdateResponse.completed).toBe(true);
  });

  // test("Delete todo using Id", async () => {
  //   const todo = await agent.post("/todos").send({
  //     title: "delete",
  //     dueDate: new Date().toISOString(),
  //     completed: false,
  //   });
  //   const parsedResponse = JSON.parse(todo.text);
  //   const todoID = parsedResponse.id;

  //   expect(parsedResponse.title).toBe("delete");

  //   const response = await agent.delete(`/todos/${todoID}`);
  //   const parsedDeleteReponse = JSON.parse(response.text);
  //   expect(parsedDeleteReponse).toStrictEqual({});
  // });
});

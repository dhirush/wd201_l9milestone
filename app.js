const express = require("express");
const app = express();
const csrf = require("tiny-csrf");
var cookieParser = require("cookie-parser");
const Sequelize = require("sequelize");
const { Todo } = require("./models");
const bodyParser = require("body-parser");
const Op = Sequelize.Op;
const path = require("path");

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("ssh! some secret string!"));
app.use(csrf("this_should_be_32_character_long", ["POST", "PUT", "DELETE"]));

app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "public")));

app.get("/todos", async function (request, response) {
  console.log("Processing list of all Todos ...");
  try {
    const todos = await Todo.findAll();
    const d = new Date().toLocaleDateString("en-CA");
    const overdue = await Todo.findAll({
      where: { dueDate: { [Op.lt]: d }, completed: false },
      order: [["id", "ASC"]],
    });
    // const overdueComplete = await Todo.findAll({
    //   where: { dueDate: { [Op.lt]: d }, completed: true },
    // });
    const later = await Todo.findAll({
      where: { dueDate: { [Op.gt]: d } },
    });
    // const laterComplete = await Todo.findAll({
    //   where: { dueDate: { [Op.gt]: d }, completed: true },
    // });
    const today = await Todo.findAll({
      where: { dueDate: { [Op.eq]: d } },
    });
    // const todayComplete = await Todo.findAll({
    //   where: { dueDate: { [Op.eq]: d }, completed: true },
    // });

    const complete = await Todo.findAll({
      where: { completed: true },
    });

    app.locals.tasks = todos;
    app.locals.overdue = overdue;
    // app.locals.overdueComplete = overdueComplete;
    app.locals.later = later;
    // app.locals.laterComplete = laterComplete;
    app.locals.today = today;
    // app.locals.todayComplete = todayComplete;

    app.locals.complete = complete;

    app.locals.csrfToken = request.csrfToken();

    if (request.accepts("html")) {
      response.render("index", {
        csrfToken: request.csrfToken(),
      });
    } else {
      response.json({ overdue, today, later });
    }
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.get("/todos/:id", async function (request, response) {
  console.log("Looking for Todo with ID: ", request.params.id);
  try {
    const todo = await todo.findByPk(request.params.id);
    return response.json(todo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.post("/todos", async function (request, response) {
  console.log("Creating new Todo: ", request.body);
  try {
    const todo = await Todo.addTodo(request.body);
    return response.redirect("/"); // response.json(todo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.put("/todos/:id/markAsCompleted", async function (request, response) {
  console.log("We have to update a Todo with ID: ", request.params.id);
  const todo = await Todo.findByPk(request.params.id);
  try {
    const updatedTodo = await todo.markAsCompleted();
    return response.json(updatedTodo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.put("/todos/:id/updateCompleteStatus", async function (request, response) {
  console.log("We have to update a Todo with ID: ", request.params.id);
  const todo = await Todo.findByPk(request.params.id);
  try {
    const updatedTodo = await todo.setCompletionStatus();
    return response.json(updatedTodo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.delete("/todos/:id", async function (request, response) {
  console.log("We have to delete a Todo with ID: ", request.params.id);
  try {
    await Todo.remove(request.params.id);
    return response.json({ success: true });
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.get("/", async function (request, response) {
  console.log("Processing list of all Todos ...");
  try {
    const todos = await Todo.findAll();
    const d = new Date().toLocaleDateString("en-CA");
    const overdue = await Todo.findAll({
      where: { dueDate: { [Op.lt]: d }, completed: false },
      order: [["id", "ASC"]],
    });
    // const overdueComplete = await Todo.findAll({
    //   where: { dueDate: { [Op.lt]: d }, completed: true },
    // });
    const later = await Todo.findAll({
      where: { dueDate: { [Op.gt]: d, completed: false } },
    });
    // const laterComplete = await Todo.findAll({
    //   where: { dueDate: { [Op.gt]: d }, completed: true },
    // });
    const today = await Todo.findAll({
      where: { dueDate: { [Op.eq]: d, completed: false } },
    });
    // const todayComplete = await Todo.findAll({
    //   where: { dueDate: { [Op.eq]: d }, completed: true },
    // });

    const complete = await Todo.findAll({
      where: { completed: true },
    });

    app.locals.tasks = todos;
    app.locals.overdue = overdue;
    // app.locals.overdueComplete = overdueComplete;
    app.locals.later = later;
    // app.locals.laterComplete = laterComplete;
    app.locals.today = today;
    // app.locals.todayComplete = todayComplete;

    app.locals.complete = complete;

    app.locals.csrfToken = request.csrfToken();

    if (request.accepts("html")) {
      response.render("index", {
        csrfToken: request.csrfToken(),
      });
    } else {
      response.json({ overdue, today, later });
    }
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

module.exports = app;

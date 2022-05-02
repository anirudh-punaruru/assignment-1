const format = require("date-fns/format");
const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");
const dbPath = path.join(__dirname, "todoApplication.db");

const app = express();
app.use(express.json());

let db = null;
const initDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000);
  } catch (e) {
    console.log(`DB error: '${e.message}'`);
    process.exit(1);
  }
};
initDbAndServer();

const convertDbTodoObjToResponseObj = (dbObject) => {
  return {
    id: dbObject.id,
    todo: dbObject.todo,
    priority: dbObject.priority,
    status: dbObject.status,
    category: dbObject.category,
    dueDate: dbObject.due_date,
  };
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};
const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};
const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};
const hasCategoryAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.status !== undefined
  );
};
const hasCategoryProperty = (requestQuery) => {
  return requestQuery.category !== undefined;
};
const hasCategoryAndPriorityProperties = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.priority !== undefined
  );
};

app.get("/todos/", async (req, res) => {
  let data;
  let getTodosQuery;
  const { status, priority, search_q = "", category } = req.query;
  switch (true) {
    case hasStatusProperty(req.query):
      getTodosQuery = `select * from todo where todo like '${search_q}' and status= '${status}';`;
      break;
    case hasPriorityProperty(req.query):
      getTodosQuery = `select * from todo where todo like '${search_q}' and priority= '${priority}';`;
      break;
    case hasPriorityAndStatusProperties(req.query):
      getTodosQuery = `select * from todo where todo like '${search_q}' and priority= '${priority}' and status= '${status}';`;
      break;
    case hasCategoryAndStatusProperties(req.query):
      getTodosQuery = `select * from todo where todo like '${search_q}' and category= '${category}' and status= '${status}';`;
      break;
    case hasCategoryProperty(req.query):
      getTodosQuery = `select * from todo where todo like '${search_q}' and category= '${category}';`;
      break;
    case hasCategoryAndPriorityProperties(req.query):
      getTodosQuery = `select * from todo where todo like '${search_q}' and category= '${category}' and priority= '${priority}';`;
      break;
    default:
      getTodosQuery = `select * from todo where todo like '${search_q}';`;
  }
  data = await db.all(getTodosQuery);
  res.send(data.map((each) => convertDbTodoObjToResponseObj(each)));
});

app.get("/todos/:todoId/", async (req, res) => {
  const { todoId } = req.params;
  const getTodoQuery = `select * from todo where id= '${todoId}';`;
  const todoItem = await db.get(getTodoQuery);
  res.send(convertDbTodoObjToResponseObj(todoItem));
});

app.get("/agenda/", async (req, res) => {
  const { date } = req.query;
  const formattedDate = format(new Date(date), "yyyy-MM-dd");
  const getDueDateQuery = `select * from todo where due_date= '${formattedDate}';`;
  const reqTodos = await db.all(getDueDateQuery);
  res.send(reqTodos.map((each) => convertDbTodoObjToResponseObj(each)));
});

app.post("/todos/", async (req, res) => {
  const { id, todo, priority, status, category, dueDate } = req.body;
  const postTodoQuery = `insert into todo (id, todo, priority, status, category, due_date) values ('${id}', '${todo}', '${priority}', '${status}', '${category}', '${dueDate}');`;
  await db.run(postTodoQuery);
  res.send("Todo Successfully Added");
});

app.put("/todos/:todoId/", async (req, res) => {
  const { todoId } = req.params;
  const { status } = req.body;
  const updateQuery = `update todo set status= '${status}' where id= '${todoId}';`;
  await db.run(updateQuery);
  res.send("Status Updated");
});
app.put("/todos/:todoId/", async (req, res) => {
  const { todoId } = req.params;
  const { priority } = req.body;
  const updateQuery = `update todo set priority= '${priority}' where id= '${todoId}';`;
  await db.run(updateQuery);
  res.send("Priority Updated");
});
app.put("/todos/:todoId/", async (req, res) => {
  const { todoId } = req.params;
  const { todo } = req.body;
  const updateQuery = `update todo set todo= '${todo}' where id= '${todoId}';`;
  await db.run(updateQuery);
  res.send("Status Updated");
});
app.put("/todos/:todoId/", async (req, res) => {
  const { todoId } = req.params;
  const { category } = req.body;
  const updateQuery = `update todo set category= '${category}' where id= '${todoId}';`;
  await db.run(updateQuery);
  res.send("Status Updated");
});
app.put("/todos/:todoId/", async (req, res) => {
  const { todoId } = req.params;
  const { dueDate } = req.body;
  const updateQuery = `update todo set due_date= '${dueDate}' where id= '${todoId}';`;
  await db.run(updateQuery);
  res.send("Status Updated");
});

app.delete("/todos/:todoId/", async (req, res) => {
  const { todoId } = req.params;
  const deleteTodo = `delete from todo where id= '${todoId}';`;
  await db.run(deleteTodo);
  res.send("Todo Deleted");
});

module.exports = app;

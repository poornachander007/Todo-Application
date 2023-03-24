const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();
app.use(express.json());

dbPath = path.join(__dirname, "todoApplication.db");
let db = null;
const initializeDBAndStartServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Started and Running At : http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndStartServer();
//.....................................................
const hasStatusAndPriority = (status, priority, search_q) => {
  return status !== undefined && priority !== undefined;
};
const hasStatus = (status) => {
  return status !== undefined;
};
const hasPriority = (priority) => {
  return priority !== undefined;
};

const getQuery = (status, priority, search_q) => {
  let query = "";
  switch (true) {
    case hasStatusAndPriority(status, priority):
      query = `SELECT * FROM todo 
                    WHERE status = '${status}' 
                         and priority = '${priority}'
                         and todo LIKE '%${search_q}%';`;
      break;
    case hasStatus(status):
      query = `SELECT * FROM todo 
                    WHERE status = '${status}'
                         and todo LIKE '%${search_q}%';`;
      break;
    case hasPriority(priority):
      query = `SELECT * FROM todo 
                    WHERE priority = '${priority}'
                         and todo LIKE '%${search_q}%';`;
      break;
    default:
      query = `SELECT * FROM todo 
                    WHERE todo LIKE '%${search_q}%';`;
      break;
  }
  return query;
};
//.....................................................
const isStatusAndPriorityAndTodo = (status, priority, todo) => {
  return status !== undefined && priority !== undefined && todo !== undefined;
};
const isStatusAndPriority = (status, priority, todo) => {
  return status !== undefined && priority !== undefined;
};
const isStatusAndTodo = (status, priority, todo) => {
  return status !== undefined && todo !== undefined;
};
const isPriorityAndTodo = (status, priority, todo) => {
  return priority !== undefined && todo !== undefined;
};
const isStatus = (status, priority, todo) => {
  return status !== undefined;
};
const isPriority = (status, priority, todo) => {
  return priority !== undefined;
};
const isTodo = (status, priority, todo) => {
  return todo !== undefined;
};

const updateQuery = (todoId, status, priority, todo) => {
  let query = [];
  switch (true) {
    case isStatusAndPriorityAndTodo(status, priority, todo):
      query[0] = `UPDATE todo SET
                                   todo = '${todo}',
                                   priority = '${priority}',
                                   status = '${status}'
                                   WHERE id=${todoId};`;
      query[1] = "Status Priority Todo Updated";
      break;
    case isStatusAndPriority(status, priority, todo):
      query[0] = `UPDATE todo SET
                                   priority = '${priority}',
                                   status = '${status}'
                                   WHERE id=${todoId};`;
      query[1] = "Status Priority Updated";
      break;
    case isStatusAndTodo(status, priority, todo):
      query[0] = `UPDATE todo SET
                                   todo = '${todo}',
                                   status = '${status}'
                                   WHERE id=${todoId};`;
      query[1] = "Status Todo Updated";
      break;
    case isPriorityAndTodo(status, priority, todo):
      query[0] = `UPDATE todo SET
                                   todo = '${todo}',
                                   priority = '${priority}'
                                   WHERE id=${todoId};`;
      query[1] = "Priority Todo Updated";
      break;
    case isStatus(status, priority, todo):
      query[0] = `UPDATE todo SET
                                   status = '${status}'
                                   WHERE id=${todoId};`;
      query[1] = "Status Updated";
      break;
    case isPriority(status, priority, todo):
      query[0] = `UPDATE todo SET
                                   priority = '${priority}'
                                   WHERE id=${todoId};`;
      query[1] = "Priority Updated";
      break;
    case isTodo(status, priority, todo):
      query[0] = `UPDATE todo SET
                                   todo = '${todo}'
                                   WHERE id=${todoId};`;
      query[1] = "Todo Updated";
      break;
    default:
      break;
  }
  return query;
};
//.....................................................

// GET list of All todos status='TO DO' API(1)
//GET http://localhost:3000/todos/?status=TO%20DO

app.get("/todos/", async (request, response) => {
  const { status, priority, search_q = "" } = request.query;
  const getAllTodosQuery = getQuery(status, priority, search_q);
  console.log("..........................", getAllTodosQuery);
  const allTodosArray = await db.all(getAllTodosQuery);
  response.send(allTodosArray);
});

//.....................................................

// GET one todo by ID API(2)
//GET http://localhost:3000/todos/todos/:todoId/
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `SELECT * FROM todo WHERE id=${todoId};`;
  const todo = await db.get(getTodoQuery);
  response.send(todo);
});

//.....................................................

// Add todo  API(3) ( Todo Successfully Added )
//POST http://localhost:3000/todos/
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const addTodoQuery = `INSERT INTO todo(id,todo,priority,status)
                                VALUES(${id},'${todo}','${priority}','${status}');`;
  const dbResponse = await db.run(addTodoQuery);
  response.send("Todo Successfully Added");
});

//.....................................................

// Update todos status by todo ID API(4) ( Status Updated )
//PUT http://localhost:3000/todos/:todoId/
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { todo, priority, status } = request.body;
  console.log(todoId, todo, priority, status);
  const resultSet = updateQuery(todoId, status, priority, todo);
  const updateTodoQuery = resultSet[0];
  const updatedMessage = resultSet[1];
  console.log(updateTodoQuery);
  console.log(updatedMessage, "....................................");
  const dbResponse = await db.run(updateTodoQuery);
  response.send(updatedMessage);
});

//.....................................................

// Delete todo by todo ID API(5) ( Todo Deleted )
//DELETE http://localhost:3000/todos/:todoId/
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteQuery = `DELETE FROM todo WHERE id=${todoId};`;
  const dbResponse = await db.run(deleteQuery);
  response.send("Todo Deleted");
});

module.exports = app;

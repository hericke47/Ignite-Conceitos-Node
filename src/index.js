const express = require('express');
const cors = require('cors');

const { v4: uuidv4, v4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers;  

  const user = users.find(user =>  user.username === username);

  if(!user){
    return response.status(400).json({error: "User not found."});
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userExists = users.some((user) => user.username === username);

  if(userExists){
    return response.status(400).json({error: "User already exists."});
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    pro: false,
    todos: [],
  }

  users.push(user)

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {todos} = request.user

  return response.json(todos).status(201)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  } 

  const {todos} = request.user;
  todos.push(todo)

  return response.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {id} = request.params;
  const {title, deadline} = request.body

  const {todos} = request.user;

  const todo = todos.find(e => e.id === id);

  if(!todo) {
    return response.status(404).json({ error: "Erro" })
  }

  todo.title = title;
  todo.deadline = deadline;

  return response.status(201).json(todo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {id} = request.params;

  const {todos} = request.user;

  const todo = todos.find(e => e.id === id);

  if(!todo) {
    return response.status(404).json({ error: "Erro" })
  }

  todo.done = true;

  return response.status(201).json(todo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {id} = request.params;

  const {todos} = request.user;

  const todo = todos.find(e => e.id === id);

  if(!todo) {
    return response.status(404).json({ error: "Erro" })
  }

  todos.splice(todo, 1);

  return response.status(204).json(todo)
});

module.exports = app;
const express = require('express');
const cors = require('cors');
const {v4:uuidv4} = require('uuid');

// const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [
];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers;

  const alreadyUserExists = users.find(user => user.username === username);
  
  if(!alreadyUserExists){
    return response.status(404).json({error:"user not found!"});
  }
  request.user = alreadyUserExists;
  next();
}

app.post('/users', (request, response) => {
  const {name, username} = request.body;


  const usernameAlreadyExists = users.some(user => user.username === username);

  if(usernameAlreadyExists){
    return response.status(400).json({error:"User name already exists!"})
  }
  const newUser = {
    id:uuidv4(),
    name,
    username,
    todos:[]
  }

  users.push(newUser);

  return response.status(201).json(newUser);
  
});

//middleware
app.get('/todos', checksExistsUserAccount, (request, response) => {
  //const {username} = request.headers;

  return response.json(request.user.todos);

});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  //const {username} = request.headers;
  const {title, deadline} = request.body;

  const newTodo = {
    id:uuidv4(),
    title,
    done:false,
    deadline: new Date(deadline),
    created_at: new Date()

  }

  request.user.todos.push(newTodo);

  return response.status(201).json(newTodo);

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {id} = request.params;
  const {title, deadline} = request.body;

  let alreadyTodoExists = false;
  let newTodo = {};
  const newTodos = request.user.todos.map(todo => {
    
    if(todo.id === id){

      alreadyTodoExists = true;
      const {id:idOldTodo, done, created_at} = todo;
      newTodo = {
        id:idOldTodo,
        title,
        done,
        deadline: new Date(deadline),
        created_at
      }
      todo = newTodo;
     

    }

    return todo;
    
  });

  if(!alreadyTodoExists){
    return response.status(404).json({error:"Todo not found!"})
  }

  request.user.todos = newTodos;

  return response.json(newTodo);


});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  let {done} = request.body;
  done = (done!= true && done != false)? true : done;
  console.log('done',done);
  const {id} = request.params;

  let todoUpdate = {};

  const newTodos = request.user.todos.map(todo =>{
    if(todo.id === id){
      
      todo.done = done;
      todoUpdate = todo;
    }

    return todo;
  })

  if(JSON.stringify(todoUpdate) === "{}"){ //Object.keys(todoUpdate).length === 0 
    return response.status(404).json({error:"Todo not Found!"})
  }
   

  request.user.todos = newTodos;

  return response.json(todoUpdate);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  // Complete aqui
});

module.exports = app;
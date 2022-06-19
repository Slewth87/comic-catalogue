var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var sqlite = require("better-sqlite3");
var cookie = require('js-cookie');

router.get('/', async function(req, res, next) {
  var error = req.query.error;
  var todos = []
  var token = req.cookies.token
  try {
    await jwt.verify(token, "SECRET_KEY" + req.query.address);
  } catch (error) {
      console.log(error)
      return res.redirect("/users/logout")
  }


  var db = new sqlite('database.db');
  var user = await db.prepare('SELECT * FROM users where address = (?)').get(req.query.address);

  try{
    var todoList = await TodoList.deployed();
    todoSol = await todoList.getAll.call();
    for (let i = 0; i < todoSol.length; i++) {
      if(todoSol[i][3] == user.id) {
        todos.push(todoSol[i])
      }
    }

  } catch(err) {
    console.log("error")
    console.log(err);
  }

  return res.render('index', { title: 'TodoList', error:error, todos:todos });
});


router.post('/add', async function(req, res, next) {
  var todo_content = req.body.task
  var error = null

  var token = req.cookies.token
  try {
    await jwt.verify(token, "SECRET_KEY" + req.body.currentAcc);
  } catch (error) {
      console.log(error)
      res.redirect("/users/logout")
      return
  }


  if(todo_content) {
    try{
      var db = new sqlite('database.db');
      var user = await db.prepare('SELECT * FROM users where address = (?)').get(req.body.currentAcc);
      const todoList = await TodoList.deployed();
      await todoList.newTask.sendTransaction(todo_content, user.id, {from: req.body.currentAcc, gas: GAS_LIMIT });

      res.redirect("/?address="+req.body.currentAcc)
      return
    } catch(err) {
      console.log("error")
      console.log(err)
      error = err
    }

  } else {
    error = "Todo had no content"
  }
  error = ""
  res.redirect('/?error=' + encodeURIComponent(error) + "&address="+req.body.currentAcc);
  return
});

router.get('/edit', function(req, res, next) {
  if(!req.query.todo_id) {
    return res.redirect("/?address="+req.query.currentAcc)
  }

  return res.render('edit', { title: 'Todo list', todo:req.query.content, todo_id:req.query.todo_id, completed:req.query.completed||false });
});

router.post('/edit', async function(req, res, next) {
  if(!req.body.todo_id) {
    return res.redirect("/?address="+req.query.currentAcc)
  }

  var { task, completed, todo_id, currentAcc } = req.body
  var token = req.cookies.token
  completed = completed || false

  try {
    await jwt.verify(token, "SECRET_KEY" + currentAcc);
  } catch (error) {
      console.log(error)
      return res.redirect("/users/logout")
  }

  try {
    var db = new sqlite('database.db');
    var user = await db.prepare('SELECT * FROM users where address = (?)').get(currentAcc);
    console.log(user)
    const todoList = await TodoList.deployed();
    await todoList.editTask.sendTransaction(todo_id, task, user.id, Boolean(completed), {from: currentAcc, gas: GAS_LIMIT });

  } catch(err) {
    console.log(err)
    return res.redirect("/edit?address="+req.body.currentAcc + "&todo_id=" + todo_id)
  }
  return res.redirect("/?address="+req.body.currentAcc)
});




module.exports = router;

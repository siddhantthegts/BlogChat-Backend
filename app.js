const express = require('express');
const db = require('./db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());
const verifyToken = require('./middleware/verificationMiddleware');
const SECRET_KEY = require('./constants');

app.get('/', verifyToken, (req, res) => {
  console.log('Hit');
  res.send('Hello from express');
});

app.post('/registerUser', async (req, res) => {
  console.log(req.body);
  try {
    const username = req.body.username;
    const password = req.body.password;
    const passwordhash = await bcrypt.hash(password, 10);
    const insert = `INSERT INTO users(username, password) VALUES ($1, $2)`;
    const values = [username, passwordhash];
    const result = db.insertData(insert, values);
    const token = jwt.sign({ userName: username }, SECRET_KEY, {
      expiresIn: 60 * 60,
    });
    res.status(200).json({ token });
  } catch (error) {
    console.log(error);
  }
});

app.get('/getBlogs', verifyToken, (req, res) => {
  const query = `SELECT * FROM blogs`;
  db.client.query(query, async (err, result) => {
    if (err) {
      console.log(err);
    } else {
      if (result.rows.length < 1) {
        res.send('Can not fetch blogs');
      } else {
        res.send(result.rows);
      }
    }
  });
});

app.get('/getBlogsByUser/:username', verifyToken, (req, res) => {
  console.log(req.params.username);
  const query = `SELECT * FROM blogs Where username = '${req.params.username}'`;
  db.client.query(query, async (err, result) => {
    if (err) {
      console.log(err);
    } else {
      if (result.rows.length < 1) {
        res.send('Can not fetch blogs');
        console.log('Can not fetch Blogs!!!');
      } else {
        console.log(result.rows);
        res.json(result.rows);
      }
    }
  });
});

app.post('/createBlog', verifyToken, async (req, res) => {
  console.log(req.body);
  const { title, content, username, timestamp, recipient } = req.body;
  const insertBlog = `INSERT INTO blogs (title,content,username,timestamp,recipient) VALUES ($1,$2,$3,$4,$5)`;
  const values = [title, content, username, timestamp, recipient];
  const result = db.insertData(insertBlog, values);
  console.log(result);
  res.send(result);
});

app.post('/login', async (req, res) => {
  try {
    console.log(req.body);
    const { username, password } = req.body;
    const queryuser = `Select password from users Where username = '${username}'`;
    db.client.query(queryuser, async (err, result) => {
      if (err) {
        console.log(err);
      } else {
        if (result.rows.length < 1) {
          res.send('User is not registered with us');
        } else {
          const login = await bcrypt.compare(password, result.rows[0].password);
          if (!login) {
            res.send('User is not logged in successfully');
          } else {
            console.log('User is logged in !!!!!');
            const token = jwt.sign({ userName: username }, SECRET_KEY, {
              expiresIn: 60 * 60,
            });
            res.status(200).json({ token });
          }
        }
      }
    });
  } catch (error) {
    console.log('Error: ' + error);
    res.status(500).send('Login failed!');
  }
});

app.listen(3000);

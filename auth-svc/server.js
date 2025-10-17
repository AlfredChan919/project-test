const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();
app.use(express.json());

const pool = mysql.createPool({
  host:'mysql', user:'root', password:'rootpass', database:'video'
});

(async ()=>{
  const conn = await pool.getConnection();
  await conn.execute(`CREATE TABLE IF NOT EXISTS users(
     id INT AUTO_INCREMENT PRIMARY KEY,
     username VARCHAR(50) UNIQUE,
     password VARCHAR(100))`);
  conn.release();
})();

app.post('/register', async (req,res)=>{
  const {username, password} = req.body;
  const hash = await bcrypt.hash(password,10);
  try{
    await pool.execute('INSERT INTO users (username,password) VALUES (?,?)',
      [username,hash]);
    res.sendStatus(201);
  }catch(e){res.status(400).json({message:'user exists'});}
});

app.post('/login', async (req,res)=>{
  const {username, password} = req.body;
  const [rows] = await pool.execute('SELECT * FROM users WHERE username=?', [username]);
  if(rows.length && await bcrypt.compare(password, rows[0].password)){
    const token = jwt.sign({uid:rows[0].id}, 'SECRET', {expiresIn:'2h'});
    return res.json({token});
  }
  res.status(401).json({message:'bad creds'});
});

app.listen(3001);

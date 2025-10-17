const express = require('express');
const multer  = require('multer');
const mysql   = require('mysql2/promise');
const path    = require('path');
const app = express();

const pool = mysql.createPool({host:'mysql',user:'root',password:'rootpass',database:'video'});

(async ()=>{
  const conn = await pool.getConnection();
  await conn.execute(`CREATE TABLE IF NOT EXISTS videos(
     id INT AUTO_INCREMENT PRIMARY KEY,
     name VARCHAR(200),
     path VARCHAR(300),
     userId INT)`);
  conn.release();
})();

const disk = multer.diskStorage({
  destination: '/storage',
  filename: (req,file,cb)=>cb(null, Date.now()+'-'+file.originalname)
});
const upload = multer({storage:disk});

function auth middleware(req,res,next){
  const bearer = req.headers.authorization;
  if(!bearer) return res.sendStatus(401);
  const token = bearer.split(' ')[1];
  jwt.verify(token, 'SECRET', (err,decoded)=>{
    if(err) return res.sendStatus(403);
    req.user = decoded;
    next();
  });
}

app.post('/upload', auth, upload.single('video'), async (req,res)=>{
  const {title} = req.body;
  const file = req.file;
  await pool.execute('INSERT INTO videos (name,path,userId) VALUES (?,?,?)',
    [title, file.filename, req.user.uid]);
  res.sendStatus(201);
});

app.listen(3002);

const express = require('express');
const cors = require('cors'); // Add this
const mysql = require('mysql');

const app = express();

// Use CORS middleware
app.use(cors({
    origin: 'http://127.0.0.1:5500'
  }));
   // This allows all origins — for development only

app.use(express.json());

// MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'blog'
});

connection.connect((err) => {
  if (err) {
    console.error('MySQL connection error:', err.stack);
    return;
  }
  console.log('Connected to MySQL');
});

app.get('/api/posts', (req, res) => {
    connection.query('SELECT * FROM posts', (err, results) => {
      if (err) return res.status(500).json({ error: 'Failed to fetch posts' });
      res.json(results);
    });
  });
  
  // ✅ POST a new post
  app.post('/api/posts', (req, res) => {
    const { title, content, author } = req.body;
    if (!title || !content || !author) {
      return res.status(400).json({ error: 'Title and content required' });
    }
  
    const query = 'INSERT INTO posts (title, content, author) VALUES (?, ?, ?)';
    connection.query(query, [title, content, author], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to insert post' });
      }
  
      res.status(201).json({ message: 'Post created', postId: result.insertId });
    });
  });

  app.get('/api/posts/:id', (req, res) => {
    const postId = req.params.id;
  
    const query = 'SELECT * FROM posts WHERE id = ?';
    connection.query(query, [postId], (err, results) => {
      if (err) {
        console.error('Error fetching post:', err.stack);
        return res.status(500).json({ error: 'Database error' });
      }
  
      if (results.length === 0) {
        return res.status(404).json({ error: 'Post not found' });
      }
  
      res.json(results[0]);
    });
  });
  
  app.put('/api/posts/:id', (req, res) => {
    const postId = req.params.id;
    const { title, content, author } = req.body;
  
    if (!title || !content || !author) {
      return res.status(400).json({ error: 'All fields are required' });
    }
  
    const query = 'UPDATE posts SET title = ?, content = ?, author = ? WHERE id = ?';
    connection.query(query, [title, content, author, postId], (err, result) => {
      if (err) {
        console.error('Error updating post:', err.stack);
        return res.status(500).json({ error: 'Database error' });
      }
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Post not found' });
      }
  
      res.json({ message: 'Post updated' });
    });
  });
  
  
  // Start server
  app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
  });


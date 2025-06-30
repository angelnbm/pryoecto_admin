import express from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const app = express();
app.use(express.json());

// Inicializar la base de datos SQLite
let db;
(async () => {
  db = await open({
    filename: './users.db',
    driver: sqlite3.Database
  });
  // Crear tabla si no existe
  await db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE
  )`);
})();

// Health check
app.get('/users/health', (req, res) => res.status(200).send('OK'));

// Registrar un nuevo usuario
app.post(['/users', '/users/'], async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'name y email son requeridos' });
  // Validar formato de email simple
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Email inválido' });
  try {
    const result = await db.run(
      'INSERT INTO users (name, email) VALUES (?, ?)',
      [name, email]
    );
    res.status(201).json({ id: result.lastID, name, email });
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT') {
      return res.status(400).json({ error: 'El email ya existe' });
    }
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

// Listar todos los usuarios
app.get(['/users', '/users/'], async (req, res) => {
  const users = await db.all('SELECT * FROM users');
  res.json(users);
});

// Obtener usuario específico
app.get('/users/:id', async (req, res) => {
  const user = await db.get('SELECT * FROM users WHERE id = ?', [req.params.id]);
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  res.json(user);
});

app.listen(3001, () => {
  console.log('User service listening on port 3001');
});
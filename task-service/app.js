import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import axios from 'axios';

const app = express();
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

// Inicializar la base de datos SQLite
let db;
(async () => {
  db = await open({
    filename: './tasks.db',
    driver: sqlite3.Database
  });
  // Crear tabla si no existe
  await db.run(`CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pendiente',
    user_id INTEGER NOT NULL
  )`);
})();

// Health check
app.get('/tasks/health', (req, res) => res.status(200).send('OK'));

// Crear una nueva tarea
app.post('/tasks', async (req, res) => {
  const { title, description, user_id } = req.body;
  if (!title || !user_id) return res.status(400).json({ error: 'title y user_id son requeridos' });

  // Validar usuario con user-service
  try {
    const userServiceUrl = process.env.USER_SERVICE_URL || 'http://user-service:3001';
    await axios.get(`${userServiceUrl}/users/${user_id}`);
  } catch (err) {
    return res.status(400).json({ error: 'Usuario no válido' });
  }

  const result = await db.run(
    'INSERT INTO tasks (title, description, user_id) VALUES (?, ?, ?)',
    [title, description || '', user_id]
  );
  res.status(201).json({ id: result.lastID, title, description, status: 'pendiente', user_id });
});

// Listar todas las tareas o filtrar por usuario
app.get('/tasks', async (req, res) => {
  const { user_id } = req.query;
  let tasks;
  if (user_id) {
    tasks = await db.all('SELECT * FROM tasks WHERE user_id = ?', [user_id]);
  } else {
    tasks = await db.all('SELECT * FROM tasks');
  }
  res.json(tasks);
});

// Obtener tarea específica
app.get('/tasks/:id', async (req, res) => {
  const task = await db.get('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
  if (!task) return res.status(404).json({ error: 'Tarea no encontrada' });
  res.json(task);
});

// Actualizar estado de una tarea
app.put('/tasks/:id', async (req, res) => {
  const { status } = req.body;
  if (!['pendiente', 'en_progreso', 'completada'].includes(status)) {
    return res.status(400).json({ error: 'Estado inválido' });
  }
  const result = await db.run('UPDATE tasks SET status = ? WHERE id = ?', [status, req.params.id]);
  if (result.changes === 0) return res.status(404).json({ error: 'Tarea no encontrada' });
  res.json({ id: req.params.id, status });
});



app.listen(3002, () => {
  console.log('Task service listening on port 3002');
});
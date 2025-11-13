const express = require('express');
const sql = require('mssql');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Configuração do SQL Server Express
const dbConfig = {
  user: 'sa',                    // teu utilizador SQL
  password: 'SQLEXPRESS_',       // tua password
  server: 'localhost\\SQLEXPRESS', // instancia local (barra dupla!)
  database: 'KanbanDB',
  options: {
    encrypt: false,
    trustServerCertificate: true, // necessário para instâncias locais
  },
};

// Endpoint para listar utilizadores
app.get('/Utilizador', async (req, res) => {
  try {
    let pool = await sql.connect(dbConfig);
    let result = await pool.request().query('SELECT * FROM Utilizador');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Endpoint de login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email e palavra-passe são obrigatórios.' });
  }

  try {
    let pool = await sql.connect(dbConfig);
    let result = await pool.request()
      .input('email', sql.VarChar, email)
      .input('password', sql.VarChar, password)
      .query('SELECT * FROM Utilizador WHERE Email = @email AND Password = @password');

    if (result.recordset.length === 0) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    res.json({ success: true, user: result.recordset[0] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.listen(3000, () => console.log('✅ API a correr em http://localhost:3000'));

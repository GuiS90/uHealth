// server.js
import { fastify } from 'fastify';
import sqlite3 from 'sqlite3';
import cors from '@fastify/cors';
import fastifyJwt from '@fastify/jwt';

const server = fastify();

// CORS
await server.register(cors, {
    origin: '*'
});

// JWT
await server.register(fastifyJwt, {
    secret: "MINHA_CHAVE_SECRETA_SUPER_SEGURA"
});

// Abrir/usar o banco SQLite (arquivo clinica.db)
const DB_PATH = './clinica.db';
const db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) {
    console.error('Erro ao abrir o banco:', err);
    process.exit(1);
  }
  console.log('Banco aberto em', DB_PATH);
});

// Função utilitária que retorna a linha do paciente (sem senha) ou null
function cpfExists(cpf) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT id, nome, documento AS cpf, data_nascimento, telefone, email, created_at
      FROM paciente
      WHERE documento = ?
      LIMIT 1
    `;
    db.get(sql, [cpf], (err, row) => {
      if (err) return reject(err);
      resolve(row || null);
    });
  });
}

// rota raiz
server.get('/', () => {
  return 'servidor acessado';
});

// rota para checar se existe paciente com o cpf informado
// body: { "cpf": "12345678900" }
server.post('/check-cpf', async (request, reply) => {
  const { cpf } = request.body ?? {};

  if (!cpf) {
    return reply.status(400).send({ error: 'cpf é obrigatório no body' });
  }

  try {
    const paciente = await cpfExists(cpf);
    if (paciente) {
      return { exists: true, paciente };
    } else {
      return { exists: false };
    }
  } catch (err) {
    request.log.error(err);
    return reply.status(500).send({ error: 'erro ao consultar o banco' });
  }
});


// ========================================================
// 🔥 ROTA DE LOGIN (CPF + senha + JWT)
// ========================================================

server.post('/login', async (request, reply) => {
  const { cpf, senha } = request.body ?? {};

  if (!cpf || !senha) {
    return reply.status(400).send({ error: 'CPF e senha são obrigatórios' });
  }

  const sql = "SELECT * FROM paciente WHERE documento = ? LIMIT 1";

  try {
    const paciente = await new Promise((resolve, reject) => {
      db.get(sql, [cpf], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!paciente) {
      return reply.status(401).send({ error: 'CPF não encontrado' });
    }

    if (paciente.senha !== senha) {
      return reply.status(401).send({ error: 'Senha incorreta' });
    }

    // Criar token JWT
    const token = server.jwt.sign({
      id: paciente.id,
      nome: paciente.nome,
      cpf: paciente.documento
    });

    return reply.send({
      message: 'Login OK',
      token,
      paciente: {
        id: paciente.id,
        nome: paciente.nome,
        cpf: paciente.documento
      }
    });

  } catch (err) {
    console.error(err);
    return reply.status(500).send({ error: 'Erro no servidor' });
  }
});


// iniciar servidor
const start = async () => {
  try {
    await server.listen({ port: 3333 });
    console.log('Servidor rodando na porta 3333');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();

// fechar db com segurança ao encerrar o node (opcional)
process.on('SIGINT', () => {
  console.log('Fechando banco...');
  db.close();
  process.exit(0);
});

server.get("/agendamentos/:idPaciente", async (request, reply) => {
    const { idPaciente } = request.params;

    const sql = `
        SELECT 
            ag.id,
            ag.status,
            ag.observacoes,
            ag.motivo_cancelamento,
            am.inicio AS data_inicio,
            am.fim AS data_fim,
            m.nome AS medico_nome,
            m.especialidade,
            s.nome AS sala_nome
        FROM agendamento ag
        JOIN agenda_medico am ON am.id = ag.agenda_id
        JOIN medico m ON m.id = ag.medico_id
        JOIN sala s ON s.id = ag.sala_id
        WHERE 
            ag.paciente_id = ?
            AND am.inicio > datetime('now', 'localtime')
            AND ag.status IN ('agendado', 'pendente')
        ORDER BY am.inicio ASC
    `;

    try {
        const result = await new Promise((resolve, reject) => {
            db.all(sql, [idPaciente], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        return { agendamentos: result };

    } catch (err) {
        console.error(err);
        return reply.status(500).send({ error: "Erro ao buscar agendamentos" });
    }
});

server.get("/historico/:idPaciente", async (request, reply) => {
    const { idPaciente } = request.params;

    const sql = `
        SELECT 
            ag.id AS agendamento_id,
            ag.status,
            ag.observacoes,
            ag.motivo_cancelamento,
            ag.created_at,

            am.id AS agenda_id,
            am.inicio AS data_inicio,
            am.fim AS data_fim,

            m.nome AS medico_nome,
            m.especialidade,

            s.nome AS sala_nome,

            con.id AS consulta_id,
            con.observacoes AS consulta_observacoes   -- <===== CORRETO!
        FROM agendamento ag
        JOIN agenda_medico am ON am.id = ag.agenda_id
        JOIN medico m ON m.id = ag.medico_id
        JOIN sala s ON s.id = ag.sala_id
        LEFT JOIN consulta con ON con.agenda_id = ag.agenda_id
        WHERE 
            ag.paciente_id = ?
            AND (
                ag.status IN ('concluido', 'cancelado')
                OR am.inicio < datetime('now', 'localtime')
            )
        ORDER BY am.inicio DESC
    `;

    try {
        const rows = await new Promise((resolve, reject) => {
            db.all(sql, [idPaciente], (err, data) => {
                if (err) reject(err);
                else resolve(data);
            });
        });

        return { historico: rows };

    } catch (err) {
        console.error(err);
        return reply.status(500).send({ error: "Erro ao buscar histórico de consultas" });
    }
});

server.get("/consulta/:id", async (request, reply) => {
    const { id } = request.params;

    const sql = `
        SELECT 
            c.id,
            c.observacoes AS descricao,
            c.status,
            c.motivo_cancelamento,
            am.inicio AS data_consulta,
            m.nome AS medico_nome,
            m.especialidade AS medico_especialidade,
            s.nome AS sala_nome
        FROM consulta c
        JOIN agenda_medico am ON am.id = c.agenda_id
        JOIN medico m ON m.id = c.medico_id
        JOIN sala s ON s.id = c.sala_id
        WHERE c.id = ?
        LIMIT 1
    `;

    return new Promise((resolve) => {
        db.get(sql, [id], (err, consulta) => {
            if (err) {
                console.error(err);
                reply.status(500).send({ error: "Erro ao buscar consulta" });
                resolve();
                return;
            }

            if (!consulta) {
                reply.status(404).send({ error: "Consulta não encontrada" });
                resolve();
                return;
            }

            // 🔥 AGORA O NOME DO CAMPO ESTÁ 100% CORRETO
            const sqlReceitas = `
                SELECT conteudo 
                FROM receita 
                WHERE consulta_id = ?
            `;

            db.all(sqlReceitas, [id], (err2, receitas) => {
                if (err2) {
                    console.error(err2);
                    reply.status(500).send({ error: "Erro ao buscar receitas" });
                    resolve();
                    return;
                }

                consulta.receitas = receitas || [];
                reply.send(consulta);
                resolve();
            });
        });
    });
});

// ROTA PARA CALENDÁRIO COM consulta_id CORRETO
server.get("/calendario/:idPaciente/:ano/:mes", async (request, reply) => {
    const { idPaciente, ano } = request.params;
    let { mes } = request.params;

    // 🔥 Garantir que o mês tenha sempre 2 dígitos, igual ao front-end
    mes = String(mes).padStart(2, "0");

    const sql = `
        SELECT
            ag.id AS agendamento_id,
            con.id AS consulta_id,
            am.id AS agenda_id,
            am.inicio AS data_consulta,
            m.nome AS medico_nome,
            m.especialidade,
            s.nome AS sala_nome
        FROM agendamento ag
        JOIN agenda_medico am ON am.id = ag.agenda_id
        JOIN medico m ON m.id = ag.medico_id
        JOIN sala s ON s.id = ag.sala_id
        LEFT JOIN consulta con ON con.agenda_id = am.id
        WHERE
            ag.paciente_id = ?
            AND strftime('%Y', am.inicio) = ?
            AND strftime('%m', am.inicio) = ?
            AND ag.status IN ('agendado','pendente','concluido')
        ORDER BY am.inicio ASC
    `;

    try {

        console.log(`[CALENDARIO] Buscando para: user=${idPaciente} ano=${ano} mes=${mes}`);

        const rows = await new Promise((resolve, reject) => {
            db.all(sql, [idPaciente, ano, mes], (err, data) => {
                if (err) reject(err);
                else resolve(data);
            });
        });

        console.log("[CALENDARIO] Retornou:", rows.length, "registros");

        return { consultas: rows };

    } catch (err) {
        console.error(err);
        return reply.status(500).send({ error: "Erro ao buscar calendário" });
    }
});

// 🔥 ROTA PARA LISTAR RECEITAS DO PACIENTE
server.get("/receitas/:idPaciente", async (request, reply) => {
    const { idPaciente } = request.params;

    const sql = `
        SELECT 
            r.id AS receita_id,
            r.conteudo,
            r.validade,
            c.id AS consulta_id,
            m.nome AS medico_nome,
            m.especialidade
        FROM receita r
        JOIN consulta c ON c.id = r.consulta_id
        JOIN medico m ON m.id = c.medico_id
        WHERE c.paciente_id = ?
        ORDER BY r.validade DESC
    `;

    try {
        const rows = await new Promise((resolve, reject) => {
            db.all(sql, [idPaciente], (err, data) => {
                if (err) reject(err);
                else resolve(data);
            });
        });

        return { receitas: rows };

    } catch (err) {
        console.error(err);
        return reply.status(500).send({ error: "Erro ao buscar receitas" });
    }
});


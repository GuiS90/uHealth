SISTEMA DE PERFIL DO PACIENTE — CRUD COMPLETO
=============================================

Este projeto implementa um sistema completo de gerenciamento de pacientes, incluindo cadastro, login, visualização de perfil, edição e exclusão de conta. 
O backend foi desenvolvido com Node.js + Fastify + SQLite, enquanto o frontend utiliza HTML, CSS e JavaScript, sendo executado com a extensão Live Server do VS Code.

---------------------------------------------------
TECNOLOGIAS UTILIZADAS
---------------------------------------------------

Backend:
- Node.js
- Fastify
- SQLite3
- CORS
- BodyParser

Frontend:
- HTML5
- CSS3
- JavaScript (Fetch API)
- Live Server (VS Code)

---------------------------------------------------
ESTRUTURA DO PROJETO
---------------------------------------------------

/frontend
    /Login
        login.html
        login_logica.js
        login_style.css
        cada.html
        cada_logica.js
        cada_style.css
        /Index
            /Agendamento
                agend.html
                agend_logica.js
                agend_style.css
            /Calendario
                cal.html
                cal_logica.js
                cal_styçe.css
            /Historico
                hist.html
                historico_logica.js
                hist_style.css
            /Receitas
                rec.html
                rec_logica.js
                rec_style.css
            index.html
            index_logica.js
            index_style.css
            perfil.html
            perfil.js
            perfil.css
/backend
    server.js
    database.db
    package.json

.gitignore
README.md

---------------------------------------------------
FUNCIONALIDADES DO SISTEMA
---------------------------------------------------

Login e Autenticação:
- Validação de credenciais
- sessionStorage para manter sessão
- Proteção de rotas

Perfil do Usuário:
- Nome, email, telefone, CPF, data de nascimento
- Edição inline

Edição com PUT:
- Endpoint PUT /paciente/:id
- Atualiza email, telefone e data de nascimento

Exclusão Total da Conta:
- Confirmação de segurança
- DELETE /paciente/:id
- Logout automático

Marcar horarios de consulta:
- Buscar horarios
- Confirmar agendamento

Calendario:
- Mostra consultas marcadas nno calendario

Receitas

Detalhes:
- Resultado
- Detalhes
- Pedidos

Banco SQLite
---------------------------------------------------
COMO EXECUTAR O PROJETO (DEPLOY LOCAL)
---------------------------------------------------

1. Clonar o repositório:
    git clone https://github.com/seu-usuario/seu-repositorio.git
    cd seu-repositorio

2. Configurar e rodar o backend:
    cd backend
    npm install
    npm start

    Servidor: http://localhost:3000

3. Rodar o frontend via Live Server no VS Code:
- Abrir a pasta frontend
- Abrir Login/login.html ou Login/cadastro.html
- Clicar em "Go Live"

O frontend rodará em:
    http://127.0.0.1:5500/Login/login.html

---------------------------------------------------
ENDPOINTS DA API
---------------------------------------------------

GET    /
POST   /check-cpf

POST   /login

POST   /paciente/cadastrar
GET    /paciente/:id
PUT    /paciente/:id
DELETE /paciente/:id

GET    /agendamentos/:idPaciente
GET    /historico/:idPaciente

POST   /agendar/opcoes-periodo
POST   /agendar/confirmar

GET    /consulta/:id

GET    /calendario/:idPaciente/:ano/:mes

GET    /receitas/:idPaciente

---------------------------------------------------
ARQUIVOS IGNORADOS (.gitignore)
---------------------------------------------------

node_modules/
database.db
.env
.vscode/
.DS_Store

---------------------------------------------------
OBJETIVO DO PROJETO
---------------------------------------------------

Projeto desenvolvido para fins acadêmicos, com foco em:
- Criação de APIs com Fastify
- CRUD completo
- Integração frontend-backend
- Controle de sessão com sessionStorage
- Banco SQLite
- Prática de rotas, validações e métodos HTTP

---------------------------------------------------
LICENÇA
---------------------------------------------------

Uso livre para fins educacionais.

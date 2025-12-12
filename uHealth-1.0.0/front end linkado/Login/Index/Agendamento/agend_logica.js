document.addEventListener("DOMContentLoaded", async () => {

    const token = localStorage.getItem("token");
    const userRaw = localStorage.getItem("user");

    if (!token || !userRaw) {
        window.location.href = "../login.html";
        return;
    }

    const user = JSON.parse(userRaw);

    const selectEspecialidade = document.getElementById("especialidade");
    const selectLocal = document.getElementById("local");
    const selectDias = document.getElementById("dias");
    const btnIA = document.querySelector(".ai-suggestion-button");

    // ============================================================
    // 🔥 1. CARREGAR ESPECIALIDADES DO BANCO
    // ============================================================
    async function loadEspecialidades() {
        try {
            const response = await fetch("http://localhost:3333/especialidades");
            const data = await response.json();

            selectEspecialidade.innerHTML = `<option value="">Selecione o especialista...</option>`;

            data.especialidades.forEach(e => {
                selectEspecialidade.innerHTML += `
                    <option value="${e.nome}">${e.nome}</option>
                `;
            });

        } catch (err) {
            console.error("Erro ao carregar especialidades:", err);
        }
    }

    // ============================================================
    // 🔥 2. CARREGAR LOCAIS DO BANCO
    // ============================================================
    async function loadLocais() {
        try {
            const response = await fetch("http://localhost:3333/locais");
            const data = await response.json();

            selectLocal.innerHTML = `<option value="">Selecione o local...</option>`;

            data.locais.forEach(l => {
                selectLocal.innerHTML += `
                    <option value="${l.nome}">${l.nome}</option>
                `;
            });

        } catch (err) {
            console.error("Erro ao carregar locais:", err);
        }
    }

    // ============================================================
    // 🔥 3. CARREGAR DIAS DISPONÍVEIS (OPCIONAL)
    // ============================================================
    async function loadDias() {
        try {
            const response = await fetch("http://localhost:3333/dias");
            const data = await response.json();

            selectDias.innerHTML = `<option value="">Dias disponíveis...</option>`;

            data.dias.forEach(d => {
                selectDias.innerHTML += `
                    <option value="${d}">${d}</option>
                `;
            });

        } catch (err) {
            console.error("Erro ao carregar dias:", err);
        }
    }

    // ============================================================
    // 🔥 4. ENVIAR AGENDAMENTO
    // ============================================================
    async function enviarAgendamento() {
        const especialidade = selectEspecialidade.value;
        const local = selectLocal.value;
        const dias = selectDias.value;

        if (!especialidade || !local || !dias) {
            alert("Por favor preencha todos os campos!");
            return;
        }

        const body = {
            user_id: user.id,
            especialidade,
            local,
            dias
        };

        try {
            const response = await fetch("http://localhost:3333/agendar", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify(body)
            });

            const data = await response.json();

            if (response.ok) {
                alert("Agendamento enviado com sucesso!");
                window.location.href = "../index.html";
            } else {
                alert("Erro: " + data.message);
            }

        } catch (err) {
            console.error("Erro ao enviar agendamento:", err);
            alert("Erro ao enviar agendamento.");
        }
    }

    // ============================================================
    // 🔥 5. IA SUGERE UM AGENDAMENTO
    // ============================================================
    btnIA.addEventListener("click", async () => {
        try {
            const response = await fetch(
                `http://localhost:3333/agendar/sugestao/${user.id}`
            );
            const data = await response.json();

            if (data.sugestao) {
                selectEspecialidade.value = data.sugestao.especialidade;
                selectLocal.value = data.sugestao.local;
                selectDias.value = data.sugestao.dia;

                alert("Sugestão de IA aplicada!");
            } else {
                alert("Nenhuma sugestão disponível.");
            }

        } catch (err) {
            console.error("Erro ao buscar sugestão:", err);
        }
    });

    // ============================================================
    // 🔥 6. Rodar carregamentos iniciais
    // ============================================================
    loadEspecialidades();
    loadLocais();
    loadDias();

});

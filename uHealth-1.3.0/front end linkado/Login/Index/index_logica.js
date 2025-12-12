document.addEventListener("DOMContentLoaded", async () => {

    // 1. Verificar login
    const token = localStorage.getItem("token");
    const userRaw = localStorage.getItem("user");

    if (!token || !userRaw) {
        window.location.href = "../login.html";
        return;
    }

    const user = JSON.parse(userRaw);
    document.querySelector(".username").textContent = user.nome;

    const listArea = document.getElementById("future-appointments");

    // 2. Buscar agendamentos reais
    try {
        const response = await fetch(`http://localhost:3333/agendamentos/${user.id}`, {
            method: "GET",
            headers: { "Authorization": "Bearer " + token }
        });

        const data = await response.json();
        listArea.innerHTML = "";

        if (!data.agendamentos || data.agendamentos.length === 0) {
            listArea.innerHTML = `<p class="empty-msg">Você não possui agendamentos futuros.</p>`;
            return;
        }

        data.agendamentos.forEach(ag => {
            const card = document.createElement("div");
            card.classList.add("appointment-card");

            const dataObj = new Date(ag.data_inicio);
            const dataFormatada = dataObj.toLocaleDateString("pt-BR");
            const horaFormatada = dataObj.toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' });

            let statusClass = "";
            if (ag.status === "agendado") statusClass = "status-agendado";
            else if (ag.status === "pendente") statusClass = "status-pendente";
            else if (ag.status === "cancelado") statusClass = "status-cancelado";
            else if (ag.status === "concluido") statusClass = "status-concluido";

            card.innerHTML = `
                <div class="appointment-title">${ag.especialidade}</div>
                <div class="appointment-info">Médico: ${ag.medico_nome}</div>
                <div class="appointment-info">Data: ${dataFormatada} às ${horaFormatada}</div>
                <div class="appointment-info">Sala: ${ag.sala_nome}</div>
                ${ag.observacoes ? `<div class="appointment-info">Obs: ${ag.observacoes}</div>` : ""}
                <div class="appointment-status ${statusClass}">
                    Status: ${ag.status}
                </div>
            `;

            listArea.appendChild(card);
        });

    } catch (err) {
        console.error("Erro ao carregar agendamentos:", err);
        listArea.innerHTML = `<p class="empty-msg">Erro ao carregar agendamentos.</p>`;
    }

    // 🔥 Botão Receitas
    document.querySelector(".nav-button.receipts").addEventListener("click", () => {
        window.location.href = "Receitas/rec.html";
    });

    // 🔥 Botão Agendamento
    document.querySelector(".nav-button.schedule-appointment").addEventListener("click", () => {
        window.location.href = "Agendamento/agend.html";
    });

});

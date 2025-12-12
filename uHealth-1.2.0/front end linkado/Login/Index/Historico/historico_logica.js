document.addEventListener("DOMContentLoaded", async () => {

    const token = localStorage.getItem("token");
    const userRaw = localStorage.getItem("user");

    if (!token || !userRaw) {
        window.location.href = "../login.html";
        return;
    }

    const user = JSON.parse(userRaw);
    const listArea = document.getElementById("history-list");

    try {
        const response = await fetch(`http://localhost:3333/historico/${user.id}`, {
            method: "GET",
            headers: { "Authorization": "Bearer " + token }
        });

        const data = await response.json();
        listArea.innerHTML = "";

        if (!data.historico || data.historico.length === 0) {
            listArea.innerHTML = `<p style="text-align:center; margin-top:10px;">Nenhuma consulta encontrada.</p>`;
            return;
        }

        data.historico.forEach(item => {

            // segurança — caso não exista consulta registrada
            if (!item.consulta_id) {
                console.warn("Agendamento sem consulta registrada:", item);
                return;
            }

            const dataObj = new Date(item.data_inicio);
            const dataFormatada = dataObj.toLocaleDateString("pt-BR");

            const div = document.createElement("a");
            div.classList.add("history-item-link");

            // 🔥 agora envia o ID da CONSULTA REAL
            div.href = "Detalhes/det.html?id=" + item.consulta_id;

            div.innerHTML = `
                <div class="history-item">
                    <p class="query-text">${item.especialidade}</p>
                    <span class="query-date">${dataFormatada}</span>
                </div>
            `;

            listArea.appendChild(div);
        });

    } catch (err) {
        console.error("Erro ao carregar histórico:", err);
        listArea.innerHTML = `<p style="text-align:center;">Erro ao carregar histórico.</p>`;
    }

});

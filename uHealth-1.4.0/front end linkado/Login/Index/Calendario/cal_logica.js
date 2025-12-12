document.addEventListener("DOMContentLoaded", async () => {

    const monthLabel = document.getElementById("month-label");
    const calendarBody = document.getElementById("calendar-body");
    const btnPrev = document.getElementById("prev-month");
    const btnNext = document.getElementById("next-month");

    const user = JSON.parse(localStorage.getItem("user"));

    let currentDate = new Date();
    let diasComConsulta = []; // 🔥 lista de dias com consultas

    const monthNames = [
        "JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO",
        "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"
    ];

    // 🔥 CARREGAR CONSULTAS DO MÊS
    async function loadReminders(year, month) {
        const reminders = document.getElementById("reminder-list");
        reminders.innerHTML = "<p>Carregando...</p>";

        try {
            const mesFormatado = String(month + 1).padStart(2, "0");

            const response = await fetch(
                `http://localhost:3333/calendario/${user.id}/${year}/${mesFormatado}`
            );

            const data = await response.json();

            console.log("CONSULTAS DO MÊS:", data.consultas);

            reminders.innerHTML = "";
            diasComConsulta = [];

            if (!data.consultas || data.consultas.length === 0) {
                reminders.innerHTML = "<p>Nenhum lembrete neste mês.</p>";
                return;
            }

            // 🔥 registrar quais dias têm consulta
            data.consultas.forEach(c => {
                const date = new Date(c.data_consulta);
                diasComConsulta.push(date.getDate()); // <-- salvando o dia do mês
            });

            // 🔥 montar lista de lembretes
            data.consultas.forEach(c => {
                const date = new Date(c.data_consulta);
                const dataFormatada = date.toLocaleDateString("pt-BR");

                const consultaId = c.consulta_id || c.agendamento_id;

                reminders.innerHTML += `
                    <div class="reminder-item">
                        <span class="reminder-dot"></span>
                        <span class="reminder-description">${c.medico_nome} (${dataFormatada})</span>

                        ${
                            consultaId
                                ? `<a href="../Historico/Detalhes/det.html?id=${consultaId}" class="reminder-details">Detalhes</a>`
                                : `<span class="reminder-details" style="opacity:0.5;cursor:default;">Sem detalhes</span>`
                        }
                    </div>
                `;
            });

        } catch (err) {
            console.error("ERRO:", err);
            reminders.innerHTML = "<p>Erro ao carregar lembretes.</p>";
        }
    }

    // 🔥 DESENHAR O CALENDÁRIO
    function renderCalendar() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        monthLabel.textContent = `${monthNames[month]} • ${year}`;

        const firstDay = new Date(year, month, 1).getDay();
        const lastDay = new Date(year, month + 1, 0).getDate();

        calendarBody.innerHTML = "";
        let row = document.createElement("tr");

        for (let i = 0; i < firstDay; i++) {
            row.appendChild(document.createElement("td"));
        }

        const today = new Date();

        for (let day = 1; day <= lastDay; day++) {
            const cell = document.createElement("td");
            cell.textContent = day;

            // 🔥 DESTACAR HOJE
            if (
                day === today.getDate() &&
                month === today.getMonth() &&
                year === today.getFullYear()
            ) {
                cell.classList.add("highlighted-day");
            }

            // 🔥 DESTACAR DIAS COM CONSULTA
            if (diasComConsulta.includes(day)) {
                cell.classList.add("highlighted-day");
            }

            row.appendChild(cell);

            if ((firstDay + day) % 7 === 0) {
                calendarBody.appendChild(row);
                row = document.createElement("tr");
            }
        }

        if (row.children.length > 0) {
            calendarBody.appendChild(row);
        }
    }

    async function atualizarMes() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        await loadReminders(year, month);
        renderCalendar();
    }

    btnPrev.addEventListener("click", () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        atualizarMes();
    });

    btnNext.addEventListener("click", () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        atualizarMes();
    });

    atualizarMes();
});

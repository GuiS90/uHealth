document.addEventListener("DOMContentLoaded", async () => {

    const selectEspecialidade = document.getElementById("especialidade");
    const selectUnidade = document.getElementById("unidade");
    const inputDataInicio = document.getElementById("data_inicio");
    const inputDataFim = document.getElementById("data_fim");
    const btnBuscar = document.getElementById("btn-buscar-horarios");
    const horariosDiv = document.getElementById("horarios-container");

    // Modal
    const modal = document.getElementById("modal-confirmacao");
    const modalInfo = document.getElementById("modal-info");
    const btnCancelar = document.getElementById("btn-cancelar");
    const btnConfirmar = document.getElementById("btn-confirmar");

    // Slot selecionado
    let slotSelecionado = null;

    // Carregar usuário
    let paciente = null;
    try {
        paciente = JSON.parse(localStorage.getItem("user"));
    } catch {}

    // ================================
    // BUSCAR HORÁRIOS
    // ================================
    async function buscarHorarios(event) {
        if (event) event.preventDefault();

        const especialidade_id = selectEspecialidade.value;
        const unidade_id = selectUnidade.value;
        const dataInicio = inputDataInicio.value;
        const dataFim = inputDataFim.value;

        if (!especialidade_id || !unidade_id || !dataInicio || !dataFim) {
            alert("Preencha todos os campos!");
            return;
        }

        try {
            const response = await fetch("http://localhost:3333/agendar/opcoes-periodo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    especialidade: especialidade_id, // o back espera esse nome
                    unidade_id,
                    dataInicio,
                    dataFim
                })
            });

            const data = await response.json();

            if (!data.success) {
                alert("Erro: " + data.message);
                return;
            }

            renderizarHorarios(data.horarios);

        } catch (err) {
            console.error("Erro ao buscar horários:", err);
            horariosDiv.innerHTML = "<p>Erro ao buscar horários.</p>";
        }
    }

    // ================================
    // RENDERIZAR HORÁRIOS
    // ================================
    function renderizarHorarios(lista) {
        horariosDiv.innerHTML = "";

        if (!lista || lista.length === 0) {
            horariosDiv.innerHTML = "<p>Nenhum horário disponível no período informado.</p>";
            return;
        }

        lista.forEach(item => {
            const bloco = document.createElement("div");
            bloco.classList.add("bloco-dia");

            let html = `<h3>${item.data}</h3>`;
            html += `<ul class="lista-horarios">`;

            item.horarios.forEach(slot => {
                html += `
                    <li 
                        class="item-horario"
                        data-agenda_id="${slot.agenda_id}"
                        data-medico_id="${slot.medico_id}"
                        data-hora="${slot.hora}"
                        data-data="${item.data}"
                    >
                        ${slot.hora}
                    </li>`;
            });

            html += `</ul>`;
            bloco.innerHTML = html;

            horariosDiv.appendChild(bloco);
        });

        document.querySelectorAll(".item-horario").forEach(btn => {
            btn.addEventListener("click", () => abrirModal(btn));
        });
    }

    // ================================
    // ABRIR MODAL
    // ================================
    function abrirModal(elemento) {
        const agenda_id = elemento.dataset.agenda_id;
        const medico_id = elemento.dataset.medico_id;
        const data = elemento.dataset.data;
        const hora = elemento.dataset.hora;
        const unidadeNome = selectUnidade.options[selectUnidade.selectedIndex].text;

        slotSelecionado = {
            agenda_id,
            medico_id,
            paciente_id: paciente?.id,
            unidade_id: selectUnidade.value,
            especialidade_id: selectEspecialidade.value,
            data,
            hora
        };

        modalInfo.innerHTML = `
            <b>Especialidade:</b> ${selectEspecialidade.options[selectEspecialidade.selectedIndex].text}<br>
            <b>Unidade:</b> ${unidadeNome}<br>
            <b>Data:</b> ${data}<br>
            <b>Hora:</b> ${hora}
        `;

        modal.classList.remove("hidden");
    }

    // ================================
    // FECHAR MODAL
    // ================================
    btnCancelar.addEventListener("click", () => {
        modal.classList.add("hidden");
        slotSelecionado = null;
    });

    // ================================
    // CONFIRMAR AGENDAMENTO
    // ================================
    btnConfirmar.addEventListener("click", async () => {
        if (!slotSelecionado) return;

        try {
            const token = localStorage.getItem("token");

            const response = await fetch("http://localhost:3333/agendar/confirmar", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify(slotSelecionado)
            });

            const data = await response.json();

            if (!data.success) {
                alert("Erro: " + data.message);
                return;
            }

            alert("Consulta agendada com sucesso!");
            modal.classList.add("hidden");

            // Recarregar horários
            buscarHorarios(new Event("manual"));

        } catch (err) {
            console.error("Erro ao confirmar:", err);
            alert("Erro ao confirmar agendamento.");
        }
    });

    btnBuscar.addEventListener("click", buscarHorarios);

});

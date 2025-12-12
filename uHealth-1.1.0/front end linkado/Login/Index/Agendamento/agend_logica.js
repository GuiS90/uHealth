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

    // Variáveis para armazenar o agendamento selecionado
    let slotSelecionado = null;

    // ================================
    // FUNÇÃO PARA BUSCAR HORÁRIOS
    // ================================
    async function buscarHorarios(event) {
        event.preventDefault(); // evita recarregar

        const especialidade = selectEspecialidade.value;
        const unidade = selectUnidade.value;
        const dataInicio = inputDataInicio.value;
        const dataFim = inputDataFim.value;

        if (!especialidade || !unidade || !dataInicio || !dataFim) {
            alert("Preencha todos os campos!");
            return;
        }

        try {
            const response = await fetch("http://localhost:3333/agendar/opcoes-periodo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    especialidade,
                    local: unidade, // backend usa req.body.local
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
    // FUNÇÃO PARA MOSTRAR HORÁRIOS
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

            item.horarios.forEach(hora => {
                html += `
                    <li class="item-horario" data-data="${item.data}" data-hora="${hora}">
                        ${hora}
                    </li>`;
            });

            html += `</ul>`;
            bloco.innerHTML = html;

            horariosDiv.appendChild(bloco);
        });

        // Torna os horários clicáveis
        document.querySelectorAll(".item-horario").forEach(btn => {
            btn.addEventListener("click", () => abrirModal(btn));
        });
    }

    // ================================
    // ABRIR MODAL DE CONFIRMAÇÃO
    // ================================
    function abrirModal(elemento) {
        const data = elemento.getAttribute("data-data");
        const hora = elemento.getAttribute("data-hora");

        slotSelecionado = {
            data,
            hora,
            especialidade: selectEspecialidade.value,
            unidade: selectUnidade.value
        };

        modalInfo.innerHTML = `
            <b>Especialidade:</b> ${slotSelecionado.especialidade}<br>
            <b>Unidade:</b> ${slotSelecionado.unidade}<br>
            <b>Data:</b> ${slotSelecionado.data}<br>
            <b>Hora:</b> ${slotSelecionado.hora}
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
            const response = await fetch("http://localhost:3333/agendar/confirmar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(slotSelecionado)
            });

            const data = await response.json();

            if (!data.success) {
                alert("Erro: " + data.message);
                return;
            }

            alert("Consulta agendada com sucesso!");

            modal.classList.add("hidden");
            buscarHorarios(new Event("manual")); // recarrega horários

        } catch (err) {
            console.error("Erro ao confirmar:", err);
            alert("Erro ao confirmar agendamento.");
        }
    });

    // ================================
    // EVENTO DO BOTÃO
    // ================================
    btnBuscar.addEventListener("click", buscarHorarios);

});

document.addEventListener("DOMContentLoaded", async () => {

    function getConsultaId() {
        const params = new URLSearchParams(window.location.search);
        return params.get("id");
    }

    const consultaId = getConsultaId();
    if (!consultaId) {
        alert("Consulta inválida!");
        return;
    }

    try {
        const response = await fetch(`http://localhost:3333/consulta/${consultaId}`);
        const data = await response.json();

        if (data.error) {
            alert("Erro: " + data.error);
            return;
        }

        // DESCRIÇÃO
        document.querySelector("#descricao").textContent =
            data.descricao?.trim() || "Sem descrição.";

        // RESULTADO
        document.querySelector("#resultado").textContent =
            data.status || "Sem resultado.";

        // PEDIDOS (receitas)
        const pedidosDiv = document.querySelector("#pedidos");

        if (Array.isArray(data.receitas) && data.receitas.length > 0) {
            pedidosDiv.innerHTML = data.receitas
                .map(r => `<li>${r.conteudo}</li>`)
                .join("");
        } else {
            pedidosDiv.innerHTML = "<li>Sem pedidos.</li>";
        }

    } catch (error) {
        console.error("Erro ao carregar detalhes:", error);
        alert("Erro ao buscar dados da consulta.");
    }
});


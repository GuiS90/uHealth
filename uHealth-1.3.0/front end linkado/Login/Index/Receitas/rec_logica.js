document.addEventListener("DOMContentLoaded", async () => {

    const recipeList = document.getElementById("recipe-list");

    const userRaw = localStorage.getItem("user");
    const user = JSON.parse(userRaw);

    recipeList.innerHTML = "<p>Carregando receitas...</p>";

    try {
        const response = await fetch(`http://localhost:3333/receitas/${user.id}`);
        const data = await response.json();

        recipeList.innerHTML = "";

        if (!data.receitas || data.receitas.length === 0) {
            recipeList.innerHTML = "<p>Você não possui receitas.</p>";
            return;
        }

        data.receitas.forEach(r => {
            const validade = r.validade
                ? new Date(r.validade).toLocaleDateString("pt-BR")
                : "Sem validade";

            recipeList.innerHTML += `
                <div class="recipe-item">
                    <div class="recipe-info">
                        <span class="recipe-name">${r.medico_nome}</span>
                        <span class="recipe-validity">Val: ${validade}</span>
                    </div>

                    <button class="renew-button" onclick="alert('Renovar receita ${r.receita_id}')">
                        Renovar
                    </button>
                </div>
            `;
        });

    } catch (err) {
        console.error("Erro ao carregar receitas", err);
        recipeList.innerHTML = "<p>Erro ao carregar receitas.</p>";
    }
});

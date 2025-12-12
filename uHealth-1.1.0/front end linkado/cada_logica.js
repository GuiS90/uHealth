const form = document.getElementById("formCadastro");
const modal = document.getElementById("modal");
const modalBtn = document.getElementById("modalBtn");

form.addEventListener("submit", function (e) {
    e.preventDefault();

    const dados = {
        nome: document.getElementById("nome").value,
        cpf: document.getElementById("cpf").value,
        nasc: document.getElementById("nasc").value,
        telefone: document.getElementById("telefone").value,
        email: document.getElementById("email").value
    };

    console.log("ENVIANDO DADOS:", dados);

    // ----- Enviar para API (exemplo) -----
    /*
    fetch("/cadastro/paciente", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados)
    })
    .then(res => res.json())
    .then(resp => console.log(resp));
    */

    modal.classList.remove("hidden");
});

modalBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
    form.reset();
});

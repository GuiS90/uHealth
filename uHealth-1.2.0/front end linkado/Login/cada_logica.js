const form = document.getElementById("formCadastro");
const modal = document.getElementById("modal");
const modalBtn = document.getElementById("modalBtn");
const linkLogin = document.getElementById("link-login");

form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const senha = document.getElementById("senha").value;
    const confirmarSenha = document.getElementById("confirmarSenha").value;

    // --- validação ---
    if (senha.length < 4) {
        alert("A senha deve ter pelo menos 4 caracteres.");
        return;
    }

    if (senha !== confirmarSenha) {
        alert("As senhas não coincidem!");
        return;
    }

    // ---------- CAMPOS AJUSTADOS PARA O BACK-END ----------
    const dados = {
        nome: document.getElementById("nome").value,
        documento: document.getElementById("cpf").value,        // <--- campo certo!
        data_nascimento: document.getElementById("nasc").value, // <--- campo certo!
        telefone: document.getElementById("telefone").value,
        email: document.getElementById("email").value,
        senha: senha                                            // <--- senha enviada corretamente
    };

    console.log("📤 ENVIANDO PARA API:", dados);

    try {
        const response = await fetch("http://localhost:3333/paciente/cadastrar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados)
        });

        const data = await response.json();

        if (!response.ok || data.success === false) {
            alert(data.message || "Erro ao cadastrar paciente.");
            return;
        }

        // Mostrar modal de sucesso
        modal.classList.remove("hidden");

    } catch (error) {
        console.error("Erro ao cadastrar:", error);
        alert("Erro ao conectar ao servidor.");
    }
});

// 🔥 Botão OK → volta para login
modalBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
    window.location.href = "login.html";
});

// 🔥 Link “Fazer login”
linkLogin.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = "login.html";
});

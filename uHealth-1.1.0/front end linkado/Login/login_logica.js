// O nome do seu arquivo JavaScript é login_logica.js
document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    const cpfInput = document.getElementById('cpf');
    const senhaInput = document.getElementById('senha');
    const btnEnter = document.getElementById('btn_enter');

    // Página de sucesso
    const PAGINA_SUCESSO = 'index/index.html'; 

    // --- FUNÇÃO DE ERRO ---
    function showErrorMessage(message) {
        const oldError = document.querySelector('.error-message');
        if (oldError) oldError.remove();

        const errorMessage = document.createElement('p');
        errorMessage.classList.add('error-message');
        errorMessage.style.color = 'red';
        errorMessage.style.textAlign = 'center';
        errorMessage.style.marginTop = '10px';
        errorMessage.textContent = message;

        form.prepend(errorMessage);
    }

    form.addEventListener('submit', function(event) {
        event.preventDefault(); 
        handleLogin();
    });

    btnEnter.addEventListener('click', function(event) {
        event.preventDefault(); 
        handleLogin();
    });

    // --- FUNÇÃO DE LOGIN COM JWT ---
    async function handleLogin() {
        const oldError = document.querySelector('.error-message');
        if (oldError) oldError.remove();

        const cpf = cpfInput.value.trim();
        const senha = senhaInput.value.trim();

        if (!cpf || !senha) {
            showErrorMessage("Por favor, preencha CPF e senha.");
            return;
        }

        try {
            const response = await fetch("http://localhost:3333/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cpf, senha })
            });

            const data = await response.json();

            if (!response.ok) {
                showErrorMessage(data.error || "Erro ao fazer login.");
                return;
            }

            // 🔥 SALVAR O JWT
            localStorage.setItem("token", data.token);

            // 🔥 SALVAR USUÁRIO
            localStorage.setItem("user", JSON.stringify(data.paciente));

            // 🔀 Redirecionar
            window.location.href = PAGINA_SUCESSO;

        } catch (error) {
            console.error("Erro na requisição:", error);
            showErrorMessage("Não foi possível conectar ao servidor.");
        }
    }
});

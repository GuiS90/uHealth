document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const userRaw = localStorage.getItem("user");

  if (!token || !userRaw) {
    window.location.href = "../login.html";
    return;
  }

  let user = JSON.parse(userRaw);
  const id = user.id;

  if (!id) {
    console.error("ID do usuário não encontrado no localStorage:", user);
    alert("Usuário inválido. Faça login novamente.");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "../login.html";
    return;
  }

  // elements
  const username = document.getElementById("username");
  const emailTop = document.getElementById("email");
  const emailInfo = document.getElementById("emailInfo");
  const phone = document.getElementById("phone");
  const cpf = document.getElementById("cpf");
  const dob = document.getElementById("dob");

  const btnEditar = document.getElementById("btnEditar");
  const btnSalvar = document.getElementById("btnSalvar");
  const btnCancelar = document.getElementById("btnCancelar");

  const modal = document.getElementById("modal");
  const btnModalClose = document.getElementById("btnModalClose");

  // Carrega perfil do servidor
  async function carregarPerfil() {
    try {
      const resp = await fetch(`http://localhost:3333/paciente/${id}`, {
        headers: { Authorization: "Bearer " + token },
      });

      if (!resp.ok) {
        console.error("Erro ao buscar perfil:", resp.status);
        throw new Error("Erro ao buscar perfil");
      }

      const data = await resp.json();

      username.textContent = data.nome ?? "—";
      emailTop.textContent = data.email ?? "—";
      emailInfo.textContent = data.email ?? "—";
      phone.textContent = data.telefone ?? "Não informado";
      cpf.textContent = data.documento ?? "Não informado";
      dob.textContent = data.data_nascimento ?? "Não informado";

      // Atualiza localStorage
      localStorage.setItem("user", JSON.stringify(data));
      user = data;
    } catch (err) {
      console.error("Erro ao carregar perfil:", err);
      alert("Erro ao carregar perfil. Veja console.");
    }
  }

  await carregarPerfil();

  // transforma spans em inputs
  function transformarEmInput(spanEl, nomeCampo) {
    let valorAtual =
      spanEl.textContent === "Não informado" ? "" : spanEl.textContent;

    if (nomeCampo === "data_nascimento") {
      if (valorAtual.includes("/")) {
        const [d, m, a] = valorAtual.split("/");
        valorAtual = `${a}-${m}-${d}`;
      }
      spanEl.innerHTML = `<input type="date" id="edit_${nomeCampo}" value="${valorAtual}">`;
      return;
    }

    spanEl.innerHTML = `<input type="text" id="edit_${nomeCampo}" value="${valorAtual}">`;
  }

  // Editar
  btnEditar.addEventListener("click", () => {
    btnEditar.classList.add("hidden");
    btnSalvar.classList.remove("hidden");
    btnCancelar.classList.remove("hidden");

    transformarEmInput(emailInfo, "email");
    transformarEmInput(phone, "telefone");
    transformarEmInput(dob, "data_nascimento");
  });

  // Cancelar edição
  btnCancelar.addEventListener("click", async () => {
    btnEditar.classList.remove("hidden");
    btnSalvar.classList.add("hidden");
    btnCancelar.classList.add("hidden");
    await carregarPerfil();
  });

  // Salvar edição
  btnSalvar.addEventListener("click", async () => {
    const emailVal =
      document.getElementById("edit_email")?.value?.trim() ?? null;
    const telefoneVal =
      document.getElementById("edit_telefone")?.value?.trim() ?? null;
    const dataNascVal =
      document.getElementById("edit_data_nascimento")?.value ?? null;

    const payload = {};
    if (emailVal !== null) payload.email = emailVal || null;
    if (telefoneVal !== null) payload.telefone = telefoneVal || null;
    if (dataNascVal !== null) payload.data_nascimento = dataNascVal || null;

    if (Object.keys(payload).length === 0) {
      alert("Nenhuma alteração para salvar.");
      return;
    }

    try {
      const resp = await fetch(`http://localhost:3333/paciente/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(payload),
      });

      let respBody = null;
      if (resp.status !== 204) {
        respBody = await resp.json().catch(() => null);
      }

      if (!resp.ok) {
        console.error("PUT retornou erro:", resp.status, respBody);
        alert(
          "Erro ao atualizar: " +
            (respBody?.message || respBody?.error || resp.statusText)
        );
        return;
      }

      if (respBody && (respBody.paciente || respBody.id)) {
        const pacienteObj = respBody.paciente ?? respBody;
        localStorage.setItem("user", JSON.stringify(pacienteObj));
      }

      await carregarPerfil();

      btnEditar.classList.remove("hidden");
      btnSalvar.classList.add("hidden");
      btnCancelar.classList.add("hidden");

      modal.classList.remove("hidden");
    } catch (err) {
      console.error("Erro no PUT:", err);
      alert("Erro ao atualizar. Veja console.");
    }
  });

  btnModalClose.addEventListener("click", () =>
    modal.classList.add("hidden")
  );

  // 🔥 EXCLUSÃO TOTAL — corrigido para usar localStorage e porta 3333
  document.getElementById("btnExcluir").addEventListener("click", async () => {
    const confirmar = confirm(
      "Tem certeza que deseja excluir sua conta? Esta ação é permanente."
    );

    if (!confirmar) return;

    try {
      const response = await fetch(`http://localhost:3333/paciente/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      if (!response.ok) {
        console.error("Erro ao excluir:", response.status);
        throw new Error("Falha ao excluir");
      }

      alert("Conta excluída com sucesso!");

      // Remover sessão
      localStorage.removeItem("user");
      localStorage.removeItem("token");

      // Redirecionar
      window.location.href = "../login.html";
    } catch (error) {
      console.error("Erro na exclusão:", error);
      alert("Erro ao excluir a conta.");
    }
  });
});

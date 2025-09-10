import { collection, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Elementos
const usuarioInput = document.getElementById("usuario");
const senhaInput = document.getElementById("senha");
const btnLogin = document.getElementById("btnLogin");
const btnLogout = document.getElementById("btnLogout");
const msgErro = document.getElementById("msgErro");
const loginContainer = document.getElementById("login-container");
const appContainer = document.getElementById("app-container");
const bemvindo = document.getElementById("bemvindo");

// LOGIN
btnLogin.addEventListener("click", async () => {
  const usuario = usuarioInput.value.trim();
  const senha = senhaInput.value.trim();

  if (!usuario || !senha) {
    msgErro.textContent = "Preencha usuário e senha!";
    msgErro.style.display = "block";
    return;
  }

  try {
    const ref = doc(collection(window.db, "usuarios"), usuario.toLowerCase());
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      msgErro.textContent = "Usuário não encontrado!";
      msgErro.style.display = "block";
      return;
    }

    const dados = snap.data();

    if (dados.senha === senha) {
      // Login bem-sucedido
      loginContainer.style.display = "none";
      appContainer.style.display = "block";
      msgErro.style.display = "none";
      bemvindo.textContent = `🎉 Bem-vindo ${dados.usuario} (${dados.tipo})`;
    } else {
      msgErro.textContent = "Senha incorreta!";
      msgErro.style.display = "block";
    }
  } catch (err) {
    console.error(err);
    msgErro.textContent = "Erro ao conectar no servidor!";
    msgErro.style.display = "block";
  }
});

// LOGOUT
btnLogout.addEventListener("click", () => {
  appContainer.style.display = "none";
  loginContainer.style.display = "block";
  usuarioInput.value = "";
  senhaInput.value = "";
});

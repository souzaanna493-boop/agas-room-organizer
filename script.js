// =============================
// LOGIN
// =============================
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      await auth.signInWithEmailAndPassword(email, password);
      alert("Login realizado com sucesso!");
      window.location.href = "home.html";
    } catch (error) {
      alert("Erro ao logar: " + error.message);
    }
  });
}

// =============================
// LOGOUT
// =============================
function logout() {
  auth.signOut().then(() => {
    window.location.href = "index.html";
  });
}

// =============================
// CADASTRO
// =============================
const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("regEmail").value;
    const password = document.getElementById("regPassword").value;

    try {
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);

      // salva no Firestore
      await db.collection("usuarios").doc(userCredential.user.uid).set({
        email: email,
        tipo: "USER"
      });

      alert("Usuário cadastrado com sucesso!");
      window.location.href = "index.html";
    } catch (error) {
      alert("Erro ao cadastrar: " + error.message);
    }
  });
}

// =============================
// RESETAR SENHA
// =============================
const resetForm = document.getElementById("resetForm");
if (resetForm) {
  resetForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("resetEmail").value;

    try {
      await auth.sendPasswordResetEmail(email);
      alert("E-mail de recuperação enviado!");
      window.location.href = "index.html";
    } catch (error) {
      alert("Erro ao enviar recuperação: " + error.message);
    }
  });
}

// =============================
// HOME (Reuniões)
// =============================
const reuniaoForm = document.getElementById("reuniaoForm");
const listaReunioes = document.getElementById("listaReunioes");

if (reuniaoForm) {
  reuniaoForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const titulo = document.getElementById("titulo").value;
    const data = document.getElementById("data").value;
    const horaInicio = document.getElementById("horaInicio").value;
    const horaFim = document.getElementById("horaFim").value;
    const organizador = document.getElementById("organizador").value;

    try {
      await db.collection("reunioes").add({
        titulo,
        data,
        horaInicio,
        horaFim,
        organizador,
        criadoEm: firebase.firestore.FieldValue.serverTimestamp()
      });

      alert("Reunião agendada com sucesso!");
      reuniaoForm.reset();
    } catch (error) {
      alert("Erro ao salvar reunião: " + error.message);
    }
  });

  // listar reuniões em tempo real
  db.collection("reunioes").orderBy("criadoEm", "desc")
    .onSnapshot((snapshot) => {
      listaReunioes.innerHTML = "";
      snapshot.forEach((doc) => {
        const r = doc.data();
        const li = document.createElement("li");
        li.textContent = `${r.titulo} - ${r.data} (${r.horaInicio} às ${r.horaFim}) - Organizador: ${r.organizador}`;
        listaReunioes.appendChild(li);
      });
    });
}

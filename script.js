// ================= Firebase Config =================
const firebaseConfig = {
  apiKey: "AIzaSyD2tV3I2rhTR80HDbrqqQ6OHWD78EJ2-eU",
  authDomain: "agas-rooms-organizer.firebaseapp.com",
  projectId: "agas-rooms-organizer",
  storageBucket: "agas-rooms-organizer.appspot.com",
  messagingSenderId: "101093561086",
  appId: "1:101093561086:web:967b2829508ab589fecbaf",
  measurementId: "G-JC4Y4PD3YV"
};

// Inicializa Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// ================= LOGIN =================
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const senha = document.getElementById("loginSenha").value;

  try {
    await auth.signInWithEmailAndPassword(email, senha);
    window.location.href = "home.html";
  } catch (error) {
    alert("Erro ao logar: " + error.message);
  }
});

// ================= CADASTRO =================
document.getElementById("registerForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("registerEmail").value;
  const senha = document.getElementById("registerSenha").value;
  const usuario = document.getElementById("registerUsuario").value;

  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, senha);
    const user = userCredential.user;

    // Salvar no Firestore
    await db.collection("usuarios").doc(user.uid).set({
      email,
      usuario,
      tipo: "Usuário"
    });

    alert("Usuário cadastrado com sucesso!");
    window.location.href = "index.html";
  } catch (error) {
    alert("Erro ao cadastrar: " + error.message);
  }
});

// ================= RECUPERAR SENHA =================
document.getElementById("resetForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("resetEmail").value;

  try {
    await auth.sendPasswordResetEmail(email);
    alert("Link para redefinição enviado para " + email);
  } catch (error) {
    alert("Erro ao enviar link: " + error.message);
  }
});

// ================= LOGOFF =================
document.getElementById("logoutBtn")?.addEventListener("click", async () => {
  await auth.signOut();
  window.location.href = "index.html";
});

// ================= REUNIÕES (CRUD) =================
const reunioesTable = document.getElementById("reunioesTable");

async function carregarReunioes() {
  const snapshot = await db.collection("reunioes").orderBy("data").get();
  reunioesTable.innerHTML = "";

  snapshot.forEach(doc => {
    const r = doc.data();
    const row = `
      <tr>
        <td>${r.titulo}</td>
        <td>${r.organizador}</td>
        <td>${r.data}</td>
        <td>${r.horaInicio}</td>
        <td>${r.horaFim}</td>
        <td>
          ${window.currentUserTipo === "ADM" ? `
            <button onclick="editarReuniao('${doc.id}')">Editar</button>
            <button onclick="excluirReuniao('${doc.id}')">Excluir</button>
          ` : ""}
        </td>
      </tr>
    `;
    reunioesTable.innerHTML += row;
  });
}

document.getElementById("agendarForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const titulo = document.getElementById("titulo").value;
  const data = document.getElementById("data").value;
  const horaInicio = document.getElementById("horaInicio").value;
  const horaFim = document.getElementById("horaFim").value;

  await db.collection("reunioes").add({
    titulo,
    data,
    horaInicio,
    horaFim,
    organizador: window.currentUsuario
  });

  alert("Reunião agendada!");
  carregarReunioes();
});

async function excluirReuniao(id) {
  if (confirm("Deseja excluir esta reunião?")) {
    await db.collection("reunioes").doc(id).delete();
    carregarReunioes();
  }
}

async function editarReuniao(id) {
  const novoTitulo = prompt("Novo título:");
  if (novoTitulo) {
    await db.collection("reunioes").doc(id).update({ titulo: novoTitulo });
    carregarReunioes();
  }
}

// ================= USUÁRIOS (APENAS ADM) =================
const usuariosTable = document.getElementById("usuariosTable");

async function carregarUsuarios() {
  const snapshot = await db.collection("usuarios").get();
  usuariosTable.innerHTML = "";

  snapshot.forEach(doc => {
    const u = doc.data();
    const row = `
      <tr>
        <td>${u.usuario}</td>
        <td>${u.tipo}</td>
        <td>
          ${u.tipo !== "ADM" ? `
            <button onclick="excluirUsuario('${doc.id}')">Excluir</button>
            <button onclick="promoverUsuario('${doc.id}')">Promover ADM</button>
          ` : "Protegido"}
        </td>
      </tr>
    `;
    usuariosTable.innerHTML += row;
  });
}

async function excluirUsuario(id) {
  if (confirm("Deseja excluir este usuário?")) {
    await db.collection("usuarios").doc(id).delete();
    carregarUsuarios();
  }
}

async function promoverUsuario(id) {
  await db.collection("usuarios").doc(id).update({ tipo: "ADM" });
  carregarUsuarios();
}

// ================= VERIFICA LOGIN =================
auth.onAuthStateChanged(async (user) => {
  if (user) {
    const doc = await db.collection("usuarios").doc(user.uid).get();
    const dados = doc.data();
    window.currentUsuario = dados.usuario;
    window.currentUserTipo = dados.tipo;

    if (document.getElementById("reunioesTable")) carregarReunioes();
    if (document.getElementById("usuariosTable") && dados.tipo === "ADM") carregarUsuarios();
  } else {
    if (!window.location.href.includes("index.html")) {
      window.location.href = "index.html";
    }
  }
});

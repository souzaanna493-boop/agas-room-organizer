// ==============================
// Configuração Firebase
// ==============================
const firebaseConfig = {
  apiKey: "AIzaSy8vemTT88BhR90q4QG6fHWD78EJ2-eU",
  authDomain: "agas-rooms-organizer.firebaseapp.com",
  projectId: "agas-rooms-organizer",
  storageBucket: "agas-rooms-organizer.appspot.com",
  messagingSenderId: "101093561086",
  appId: "1:101093561086:web:9e7c229d39ba859fcbaf",
  measurementId: "G-JC4Y4PD3YV"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// ==============================
// LOGIN
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const emailOrUser = document.getElementById("loginEmail").value.trim();
    const senha = document.getElementById("loginPassword").value.trim();

    try {
        let emailToLogin = emailOrUser;

        // Se o usuário digitou um nome de usuário, busca o email correspondente no Firestore
        if (!emailOrUser.includes("@")) {
            const q = query(collection(db, "usuarios"), where("usuario", "==", emailOrUser));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                emailToLogin = querySnapshot.docs[0].data().email;
            } else {
                throw new Error("Usuário não encontrado.");
            }
        }

        // Agora faz login com email encontrado + senha
        const userCredential = await signInWithEmailAndPassword(auth, emailToLogin, senha);

        // Redireciona após login
        localStorage.setItem("usuarioLogado", userCredential.user.email);
        window.location.href = "home.html";

    } catch (error) {
        alert("Erro no login: " + error.message);
    }
});


// ==============================
// REGISTRO
// ==============================
async function register(event) {
  event.preventDefault();
  const usuario = document.getElementById("register-usuario").value;
  const email = document.getElementById("register-email").value;
  const senha = document.getElementById("register-senha").value;

  try {
    const cred = await auth.createUserWithEmailAndPassword(email, senha);
    await db.collection("usuarios").doc(cred.user.uid).set({
      usuario: usuario,
      email: email,
      tipo: "Usuário"
    });
    alert("Usuário cadastrado com sucesso!");
    window.location.href = "index.html";
  } catch (error) {
    alert("Erro no cadastro: " + error.message);
  }
}

// ==============================
// LOGOUT
// ==============================
async function logout() {
  await auth.signOut();
  window.location.href = "index.html";
}

// ==============================
// REDEFINIR SENHA
// ==============================
async function resetPassword(event) {
  event.preventDefault();
  const email = document.getElementById("reset-email").value;
  try {
    await auth.sendPasswordResetEmail(email);
    alert("Email de redefinição enviado!");
    window.location.href = "index.html";
  } catch (error) {
    alert("Erro ao enviar redefinição: " + error.message);
  }
}

// ==============================
// CARREGAR REUNIÕES (home.html)
// ==============================
async function carregarReunioes() {
  const lista = document.getElementById("lista-reunioes");
  if (!lista) return;

  const snap = await db.collection("reunioes").get();
  lista.innerHTML = "";
  snap.forEach(doc => {
    const r = doc.data();
    lista.innerHTML += `
      <tr>
        <td>${r.titulo}</td>
        <td>${r.organizador}</td>
        <td>${r.data}</td>
        <td>${r.inicio}</td>
        <td>${r.fim}</td>
        <td>
          <button onclick="editarReuniao('${doc.id}')">Editar</button>
          <button onclick="excluirReuniao('${doc.id}')">Excluir</button>
        </td>
      </tr>
    `;
  });
}

// ==============================
// AGENDAR REUNIÃO
// ==============================
async function agendarReuniao(event) {
  event.preventDefault();
  const user = auth.currentUser;
  if (!user) {
    alert("Você precisa estar logado.");
    return;
  }

  const titulo = document.getElementById("titulo").value;
  const data = document.getElementById("data").value;
  const inicio = document.getElementById("inicio").value;
  const fim = document.getElementById("fim").value;

  await db.collection("reunioes").add({
    titulo,
    organizador: user.email,
    data,
    inicio,
    fim
  });

  alert("Reunião agendada!");
  carregarReunioes();
}

// ==============================
// GERENCIAR USUÁRIOS (ADM)
// ==============================
async function carregarUsuarios() {
  const lista = document.getElementById("lista-usuarios");
  if (!lista) return;

  const snap = await db.collection("usuarios").get();
  lista.innerHTML = "";
  snap.forEach(doc => {
    const u = doc.data();
    lista.innerHTML += `
      <tr>
        <td>${u.usuario}</td>
        <td>${u.tipo}</td>
        <td>
          <button onclick="excluirUsuario('${doc.id}')">Excluir</button>
          <button onclick="promoverADM('${doc.id}')">Promover ADM</button>
        </td>
      </tr>
    `;
  });
}

async function excluirUsuario(id) {
  await db.collection("usuarios").doc(id).delete();
  carregarUsuarios();
}

async function promoverADM(id) {
  await db.collection("usuarios").doc(id).update({
    tipo: "ADM"
  });
  carregarUsuarios();
}

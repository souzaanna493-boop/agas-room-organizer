// ==============================
// Importações Firebase
// ==============================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  deleteDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ==============================
// Configuração Firebase
// ==============================
const firebaseConfig = {
  apiKey: "AIzaSyBTtrnRR9bB0pRqc6tHDHJvB0rBJ7cFz4w",
  authDomain: "agas-rooms-organizer.firebaseapp.com",
  projectId: "agas-rooms-organizer",
  storageBucket: "agas-rooms-organizer.appspot.com",
  messagingSenderId: "101093561086",
  appId: "1:101093561086:web:967b2829508ab589fecbaf",
  measurementId: "G-JC4Y4PD3YV"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ==============================
// LOGIN
// ==============================
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const emailOrUser = document.getElementById("loginEmail").value.trim();
  const senha = document.getElementById("loginPassword").value.trim();

  try {
    let emailToLogin = emailOrUser;

    // Se for usuário, busca o email no Firestore
    if (!emailOrUser.includes("@")) {
      const q = query(collection(db, "usuarios"), where("usuario", "==", emailOrUser));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        emailToLogin = querySnapshot.docs[0].data().email;
      } else {
        throw new Error("Usuário não encontrado.");
      }
    }

    // Login no Firebase
    const userCredential = await signInWithEmailAndPassword(auth, emailToLogin, senha);

    localStorage.setItem("usuarioLogado", userCredential.user.email);
    window.location.href = "home.html";

  } catch (error) {
    alert("Erro no login: " + error.message);
  }
});

// ==============================
// CADASTRO
// ==============================
document.getElementById("registerForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const usuario = document.getElementById("registerUsuario").value.trim();
  const email = document.getElementById("registerEmail").value.trim();
  const senha = document.getElementById("registerPassword").value.trim();

  try {
    await createUserWithEmailAndPassword(auth, email, senha);

    await addDoc(collection(db, "usuarios"), {
      usuario,
      email,
      tipo: "Usuário"
    });

    alert("Conta criada com sucesso!");
    window.location.href = "index.html";
  } catch (error) {
    alert("Erro no cadastro: " + error.message);
  }
});

// ==============================
// RECUPERAÇÃO DE SENHA
// ==============================
document.getElementById("recoverForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("recoverEmail").value.trim();

  try {
    await sendPasswordResetEmail(auth, email);
    alert("Link de redefinição enviado para seu e-mail.");
    window.location.href = "index.html";
  } catch (error) {
    alert("Erro: " + error.message);
  }
});

// ==============================
// LOGOUT
// ==============================
document.getElementById("logoutBtn")?.addEventListener("click", async () => {
  await signOut(auth);
  localStorage.removeItem("usuarioLogado");
  window.location.href = "index.html";
});

// ==============================
// LISTAR REUNIÕES
// ==============================
async function carregarReunioes() {
  const lista = document.getElementById("listaReunioes");
  if (!lista) return;

  lista.innerHTML = "";

  const querySnapshot = await getDocs(collection(db, "reunioes"));
  querySnapshot.forEach((docSnap) => {
    const r = docSnap.data();
    const item = document.createElement("tr");

    item.innerHTML = `
      <td>${r.titulo}</td>
      <td>${r.organizador}</td>
      <td>${r.data}</td>
      <td>${r.horaInicio}</td>
      <td>${r.horaFim}</td>
      <td>
        <button class="btn-editar" data-id="${docSnap.id}">Editar</button>
        <button class="btn-excluir" data-id="${docSnap.id}">Excluir</button>
      </td>
    `;
    lista.appendChild(item);
  });
}
carregarReunioes();

// ==============================
// LISTAR USUÁRIOS (só ADM vê)
// ==============================
async function carregarUsuarios() {
  const lista = document.getElementById("listaUsuarios");
  if (!lista) return;

  lista.innerHTML = "";

  const querySnapshot = await getDocs(collection(db, "usuarios"));
  querySnapshot.forEach((docSnap) => {
    const u = docSnap.data();
    const item = document.createElement("tr");

    item.innerHTML = `
      <td>${u.usuario}</td>
      <td>${u.tipo}</td>
      <td>
        <button class="btn-excluir" data-id="${docSnap.id}">Excluir</button>
        <button class="btn-promover" data-id="${docSnap.id}">Promover ADM</button>
      </td>
    `;
    lista.appendChild(item);
  });
}
carregarUsuarios();

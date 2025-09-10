// ===============================
// Configuração do Firebase
// ===============================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "agas-rooms-organizer.firebaseapp.com",
  projectId: "agas-rooms-organizer",
  storageBucket: "agas-rooms-organizer.appspot.com",
  messagingSenderId: "SEU_SENDER_ID",
  appId: "SUA_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ===============================
// Login
// ===============================
async function loginUser(username, password) {
  const ref = doc(db, "usuarios", username);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    alert("Usuário não encontrado!");
    return;
  }

  const data = snap.data();
  if (data.senha !== password) {
    alert("Senha incorreta!");
    return;
  }

  // Salva sessão temporária
  sessionStorage.setItem("usuario", JSON.stringify(data));

  // Redireciona para home
  window.location.href = "home.html";
}

document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  await loginUser(username, password);
});

// ===============================
// Carregar Home
// ===============================
async function carregarHome() {
  const user = JSON.parse(sessionStorage.getItem("usuario"));
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  document.getElementById("welcomeUser").textContent = `🎉 Bem-vindo ${user.usuario} (${user.tipo})`;

  if (user.tipo === "ADM") {
    document.getElementById("usuariosTab").style.display = "inline-block";
    document.querySelectorAll(".admin-only").forEach(btn => btn.style.display = "inline-block");
  } else {
    document.getElementById("usuariosTab").style.display = "none";
    document.querySelectorAll(".admin-only").forEach(btn => btn.style.display = "none");
  }

  await carregarReunioes();
  if (user.tipo === "ADM") await carregarUsuarios();
}

document.getElementById("logoffBtn")?.addEventListener("click", () => {
  sessionStorage.clear();
  window.location.href = "index.html";
});

// ===============================
// Reuniões
// ===============================
async function agendarReuniao(titulo, data, inicio, fim) {
  const user = JSON.parse(sessionStorage.getItem("usuario"));
  if (!user) return;

  const id = Date.now().toString();
  await setDoc(doc(db, "reunioes", id), {
    titulo,
    data,
    inicio,
    fim,
    organizador: user.usuario
  });

  await carregarReunioes();
}

async function carregarReunioes() {
  const lista = document.getElementById("listaReunioes");
  if (!lista) return;
  lista.innerHTML = "";

  const snap = await getDocs(collection(db, "reunioes"));
  const user = JSON.parse(sessionStorage.getItem("usuario"));

  snap.forEach((docSnap) => {
    const r = docSnap.data();
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${r.titulo}</td>
      <td>${r.organizador}</td>
      <td>${r.data}</td>
      <td>${r.inicio}</td>
      <td>${r.fim}</td>
      <td>
        <button class="admin-only btn-edit" data-id="${docSnap.id}">Editar</button>
        <button class="admin-only btn-delete" data-id="${docSnap.id}">Excluir</button>
      </td>
    `;

    lista.appendChild(tr);
  });

  // Botões só aparecem se ADM
  if (user.tipo !== "ADM") {
    document.querySelectorAll(".admin-only").forEach(btn => btn.style.display = "none");
  }

  // Eventos dos botões
  document.querySelectorAll(".btn-delete").forEach(btn => {
    btn.addEventListener("click", async () => {
      await deleteDoc(doc(db, "reunioes", btn.dataset.id));
      await carregarReunioes();
    });
  });
}

document.getElementById("reuniaoForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const titulo = document.getElementById("tituloReuniao").value;
  const data = document.getElementById("dataReuniao").value;
  const inicio = document.getElementById("horaInicio").value;
  const fim = document.getElementById("horaFim").value;

  await agendarReuniao(titulo, data, inicio, fim);
});

// ===============================
// Usuários (somente ADM)
// ===============================
async function carregarUsuarios() {
  const lista = document.getElementById("listaUsuarios");
  if (!lista) return;
  lista.innerHTML = "";

  const snap = await getDocs(collection(db, "usuarios"));

  snap.forEach((docSnap) => {
    const u = docSnap.data();
    const tr = document.createElement("tr");

    let botoes = "";
    if (u.tipo === "ADM") {
      botoes = "<td>Protegido</td>";
    } else {
      botoes = `
        <td>
          <button class="btn-delete-user" data-id="${docSnap.id}">Excluir</button>
          <button class="btn-reset-pass" data-id="${docSnap.id}">Redefinir Senha</button>
          <button class="btn-promote" data-id="${docSnap.id}">Promover ADM</button>
        </td>
      `;
    }

    tr.innerHTML = `
      <td>${u.usuario}</td>
      <td>${u.tipo}</td>
      ${botoes}
    `;

    lista.appendChild(tr);
  });

  // Eventos
  document.querySelectorAll(".btn-delete-user").forEach(btn => {
    btn.addEventListener("click", async () => {
      await deleteDoc(doc(db, "usuarios", btn.dataset.id));
      await carregarUsuarios();
    });
  });

  document.querySelectorAll(".btn-promote").forEach(btn => {
    btn.addEventListener("click", async () => {
      await updateDoc(doc(db, "usuarios", btn.dataset.id), { tipo: "ADM" });
      await carregarUsuarios();
    });
  });
}

// ===============================
// Executar carregamento do Home
// ===============================
if (window.location.pathname.includes("home.html")) {
  carregarHome();
}

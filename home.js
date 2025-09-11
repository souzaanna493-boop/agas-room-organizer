// Importando Firebase
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

// Configuração Firebase
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
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

// Controle de abas
const tabs = document.querySelectorAll(".tabBtn");
const tabContents = document.querySelectorAll(".tabContent");

tabs.forEach(btn => {
  btn.addEventListener("click", () => {
    tabs.forEach(b => b.classList.remove("active"));
    tabContents.forEach(c => c.classList.remove("active"));

    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
});

// ================== VERIFICA USUÁRIO LOGADO ==================
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  // Mostra email/nome
  document.getElementById("userInfo").innerText = `Logado como: ${user.email}`;

  // Verifica se é admin
  const userDoc = await getDoc(doc(db, "usuarios", user.email));
  const isAdmin = userDoc.exists() && userDoc.data().admin === true;

  carregarReunioes(isAdmin);
  carregarUsuarios(isAdmin);
});

// ================== REUNIÕES ==================
const formReuniao = document.getElementById("formReuniao");
if (formReuniao) {
  formReuniao.addEventListener("submit", async (e) => {
    e.preventDefault();
    const titulo = document.getElementById("titulo").value;
    const data = document.getElementById("data").value;
    const horaInicio = document.getElementById("horaInicio").value;
    const horaFim = document.getElementById("horaFim").value;

    try {
      await addDoc(collection(db, "reunioes"), {
        titulo,
        data,
        horaInicio,
        horaFim,
        organizador: auth.currentUser.email
      });

      alert("Reunião agendada!");
      formReuniao.reset();
      carregarReunioes();
    } catch (error) {
      alert("Erro ao agendar: " + error.message);
    }
  });
}

async function carregarReunioes(isAdmin = false) {
  const lista = document.getElementById("listaReunioes");
  lista.innerHTML = "";
  const querySnapshot = await getDocs(collection(db, "reunioes"));
  querySnapshot.forEach((docSnap) => {
    const reuniao = docSnap.data();
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${reuniao.titulo}</td>
      <td>${reuniao.data}</td>
      <td>${reuniao.horaInicio}</td>
      <td>${reuniao.horaFim}</td>
      <td>${reuniao.organizador}</td>
      <td>
        ${isAdmin ? `
          <button class="btn btn-editar" onclick="editarReuniao('${docSnap.id}', '${reuniao.titulo}', '${reuniao.data}', '${reuniao.horaInicio}', '${reuniao.horaFim}')">Editar</button>
          <button class="btn btn-excluir" onclick="excluirReuniao('${docSnap.id}')">Excluir</button>
        ` : ""}
      </td>
    `;
    lista.appendChild(row);
  });
}

window.excluirReuniao = async function(id) {
  if (confirm("Deseja realmente excluir?")) {
    await deleteDoc(doc(db, "reunioes", id));
    carregarReunioes();
  }
};

window.editarReuniao = async function(id, titulo, data, horaInicio, horaFim) {
  const novoTitulo = prompt("Novo título:", titulo);
  const novaData = prompt("Nova data:", data);
  const novaHoraInicio = prompt("Novo horário de início:", horaInicio);
  const novaHoraFim = prompt("Novo horário de fim:", horaFim);

  if (novoTitulo && novaData && novaHoraInicio && novaHoraFim) {
    await updateDoc(doc(db, "reunioes", id), {
      titulo: novoTitulo,
      data: novaData,
      horaInicio: novaHoraInicio,
      horaFim: novaHoraFim
    });
    carregarReunioes();
  }
};

// ================== USUÁRIOS ==================
async function carregarUsuarios(isAdmin = false) {
  const lista = document.getElementById("listaUsuarios");
  lista.innerHTML = "";
  const querySnapshot = await getDocs(collection(db, "usuarios"));
  querySnapshot.forEach((docSnap) => {
    const user = docSnap.data();
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${user.username}</td>
      <td>${user.email}</td>
      <td>${user.admin ? "Sim" : "Não"}</td>
      <td>
        ${isAdmin ? `
          <button class="btn btn-promover" onclick="promoverUsuario('${docSnap.id}')">Tornar Admin</button>
          <button class="btn btn-senha" onclick="resetarSenha('${user.email}')">Resetar Senha</button>
        ` : ""}
      </td>
    `;
    lista.appendChild(row);
  });
}

window.promoverUsuario = async function(id) {
  await updateDoc(doc(db, "usuarios", id), { admin: true });
  alert("Usuário promovido a admin!");
  carregarUsuarios(true);
};

window.resetarSenha = async function(email) {
  const { getAuth, sendPasswordResetEmail } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js");
  const auth = getAuth();
  await sendPasswordResetEmail(auth, email);
  alert("E-mail de redefinição enviado para " + email);
};

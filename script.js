// Importações Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Configuração Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDvT3VziThR80Hdrbqq6OHWD7BEJ2-eU",
  authDomain: "agas-rooms-organizer.firebaseapp.com",
  projectId: "agas-rooms-organizer",
  storageBucket: "agas-rooms-organizer.appspot.com",
  messagingSenderId: "101893561086",
  appId: "1:101893561086:web:967b2b2958ab589fecbaf",
  measurementId: "G-JC4Y4PD3VV",
};

// Inicialização
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ----------------------------
// CADASTRO
// ----------------------------
async function registerUser(email, senha, usuario, tipo = "USER") {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
    const user = userCredential.user;

    // Salvar no Firestore
    await setDoc(doc(db, "usuarios", user.uid), {
      email,
      usuario,
      tipo,
    });

    alert("Usuário cadastrado com sucesso!");
    window.location.href = "index.html";
  } catch (error) {
    alert("Erro ao cadastrar: " + error.message);
  }
}

// ----------------------------
// LOGIN
// ----------------------------
async function loginUser(email, senha) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, senha);
    const user = userCredential.user;

    // Buscar dados no Firestore
    const userDoc = await getDoc(doc(db, "usuarios", user.uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      localStorage.setItem("usuarioLogado", JSON.stringify(userData));
      window.location.href = "home.html";
    } else {
      alert("Usuário não encontrado no banco.");
    }
  } catch (error) {
    alert("Erro ao logar: " + error.message);
  }
}

// ----------------------------
// LOGOFF
// ----------------------------
async function logoff() {
  await signOut(auth);
  localStorage.removeItem("usuarioLogado");
  window.location.href = "index.html";
}

// ----------------------------
// RECUPERAÇÃO DE SENHA
// ----------------------------
async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email);
    alert("E-mail de recuperação enviado!");
  } catch (error) {
    alert("Erro: " + error.message);
  }
}

// ----------------------------
// REUNIÕES
// ----------------------------
async function criarReuniao(titulo, data, horaInicio, horaFim, organizador) {
  try {
    await addDoc(collection(db, "reunioes"), {
      titulo,
      data,
      horaInicio,
      horaFim,
      organizador,
    });
    alert("Reunião criada com sucesso!");
    listarReunioes();
  } catch (error) {
    alert("Erro ao criar reunião: " + error.message);
  }
}

async function listarReunioes() {
  const tabela = document.getElementById("tabela-reunioes");
  if (!tabela) return;

  tabela.innerHTML = "";

  const querySnapshot = await getDocs(collection(db, "reunioes"));
  querySnapshot.forEach((docSnap) => {
    const reuniao = docSnap.data();
    const user = JSON.parse(localStorage.getItem("usuarioLogado"));
    const podeEditar = user.tipo === "ADM";

    const row = `
      <tr>
        <td>${reuniao.titulo}</td>
        <td>${reuniao.organizador}</td>
        <td>${reuniao.data}</td>
        <td>${reuniao.horaInicio}</td>
        <td>${reuniao.horaFim}</td>
        <td>
          ${podeEditar ? `
            <button onclick="editarReuniao('${docSnap.id}')">Editar</button>
            <button onclick="excluirReuniao('${docSnap.id}')">Excluir</button>
          ` : ""}
        </td>
      </tr>
    `;
    tabela.innerHTML += row;
  });
}

async function editarReuniao(id) {
  const novoTitulo = prompt("Novo título:");
  if (!novoTitulo) return;

  await updateDoc(doc(db, "reunioes", id), { titulo: novoTitulo });
  alert("Reunião atualizada!");
  listarReunioes();
}

async function excluirReuniao(id) {
  if (!confirm("Tem certeza que deseja excluir?")) return;
  await deleteDoc(doc(db, "reunioes", id));
  alert("Reunião excluída!");
  listarReunioes();
}

// ----------------------------
// EXPORTAR FUNÇÕES PRO HTML
// ----------------------------
window.registerUser = registerUser;
window.loginUser = loginUser;
window.logoff = logoff;
window.resetPassword = resetPassword;
window.criarReuniao = criarReuniao;
window.listarReunioes = listarReunioes;
window.editarReuniao = editarReuniao;
window.excluirReuniao = excluirReuniao;

// Auto carregar reuniões se estiver na home
document.addEventListener("DOMContentLoaded", () => {
  if (window.location.pathname.includes("home.html")) {
    listarReunioes();
  }
});

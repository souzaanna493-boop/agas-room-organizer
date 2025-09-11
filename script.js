// Importa funções do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, addDoc, collection, getDocs, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Configuração do Firebase
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
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Login
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, senha);
    const user = userCredential.user;

    // Buscar dados no Firestore
    const userDoc = await getDoc(doc(db, "usuarios", user.uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();

      // Normaliza o tipo (ADM / USUARIO)
      const tipo = (userData.tipo || "").toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

      localStorage.setItem("usuarioLogado", JSON.stringify({
        uid: user.uid,
        email: user.email,
        usuario: userData.usuario,
        tipo: tipo
      }));

      window.location.href = "home.html";
    } else {
      alert("Usuário não encontrado no banco de dados.");
    }
  } catch (error) {
    alert("Erro ao logar: " + error.message);
  }
});

// Registro
document.getElementById("registerForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;
  const usuario = document.getElementById("usuario").value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
    const user = userCredential.user;

    await setDoc(doc(db, "usuarios", user.uid), {
      email: email,
      usuario: usuario,
      tipo: "USUARIO" // sempre padrão
    });

    alert("Conta criada com sucesso!");
    window.location.href = "index.html";
  } catch (error) {
    alert("Erro ao criar conta: " + error.message);
  }
});

// Recuperação de senha
document.getElementById("resetForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;

  try {
    await sendPasswordResetEmail(auth, email);
    alert("Link de recuperação enviado para o e-mail.");
    window.location.href = "index.html";
  } catch (error) {
    alert("Erro ao enviar link: " + error.message);
  }
});

// Logout
document.getElementById("btnLogoff")?.addEventListener("click", async () => {
  await signOut(auth);
  localStorage.removeItem("usuarioLogado");
  window.location.href = "index.html";
});

// Carregar dados do usuário logado
window.addEventListener("DOMContentLoaded", async () => {
  if (window.location.pathname.includes("home.html")) {
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
    if (!usuarioLogado) {
      window.location.href = "index.html";
      return;
    }

    document.getElementById("welcomeUser").innerText = `🎉 Bem-vindo ${usuarioLogado.usuario} (${usuarioLogado.tipo})`;

    if (usuarioLogado.tipo === "ADM") {
      document.getElementById("btnHorarios").style.display = "block";
      document.getElementById("btnUsuarios").style.display = "block";
    } else {
      document.getElementById("btnHorarios").style.display = "none";
      document.getElementById("btnUsuarios").style.display = "none";
    }

    carregarReunioes(usuarioLogado.tipo);
  }
});

// Função para carregar reuniões
async function carregarReunioes(tipo) {
  const tabela = document.getElementById("tabelaReunioes");
  tabela.innerHTML = "";

  const querySnapshot = await getDocs(collection(db, "reunioes"));
  querySnapshot.forEach((docSnap) => {
    const reuniao = docSnap.data();
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${reuniao.titulo}</td>
      <td>${reuniao.organizador}</td>
      <td>${reuniao.data}</td>
      <td>${reuniao.horaInicio}</td>
      <td>${reuniao.horaFim}</td>
      <td>
        ${tipo === "ADM" ? `
          <button class="btn-editar" data-id="${docSnap.id}">Editar</button>
          <button class="btn-excluir" data-id="${docSnap.id}">Excluir</button>
        ` : ""}
      </td>
    `;

    tabela.appendChild(tr);
  });
}

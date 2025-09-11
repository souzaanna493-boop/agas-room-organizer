// =======================
// Import Firebase
// =======================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
  getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  sendPasswordResetEmail, signOut 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
  getFirestore, doc, setDoc, getDoc, collection, addDoc, getDocs, updateDoc, deleteDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// =======================
// Firebase Config
// =======================
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

// =======================
// LOGIN
// =======================
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, "usuarios", user.uid));
      if (userDoc.exists()) {
        const dados = userDoc.data();
        const tipo = (dados.tipo || "").toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        localStorage.setItem("usuarioLogado", JSON.stringify({
          uid: user.uid,
          usuario: dados.usuario,
          email: dados.email,
          tipo: tipo
        }));

        window.location.href = "home.html";
      } else {
        alert("Usuário não encontrado no Firestore.");
      }
    } catch (error) {
      alert("Erro ao logar: " + error.message);
    }
  });
}

// =======================
// CADASTRO
// =======================
const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const usuario = document.getElementById("usuario").value;
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;

      await setDoc(doc(db, "usuarios", user.uid), {
        usuario,
        email,
        tipo: "USUARIO"
      });

      alert("Conta criada com sucesso!");
      window.location.href = "index.html";
    } catch (error) {
      alert("Erro ao cadastrar: " + error.message);
    }
  });
}

// =======================
// RECUPERAÇÃO DE SENHA
// =======================
const resetForm = document.getElementById("resetForm");
if (resetForm) {
  resetForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;

    try {
      await sendPasswordResetEmail(auth, email);
      alert("Link de redefinição enviado para seu e-mail!");
      window.location.href = "index.html";
    } catch (error) {
      alert("Erro ao enviar e-mail: " + error.message);
    }
  });
}

// =======================
// LOGOUT
// =======================
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    localStorage.removeItem("usuarioLogado");
    window.location.href = "index.html";
  });
}

// =======================
// HOME (REUNIÕES E USUÁRIOS)
// =======================
if (window.location.pathname.includes("home.html")) {
  const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
  if (!usuarioLogado) {
    window.location.href = "index.html";
  }

  document.getElementById("user-name").innerText = `${usuarioLogado.usuario} (${usuarioLogado.tipo})`;

  // Esconde aba Usuários se não for ADM
  if (usuarioLogado.tipo !== "ADM") {
    document.querySelector('[data-tab="usuarios"]').style.display = "none";
  }

  // ================= Reuniões =================
  const reuniaoForm = document.getElementById("reuniaoForm");
  const listaReunioes = document.getElementById("reunioes-list");

  reuniaoForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const titulo = document.getElementById("titulo").value;
    const data = document.getElementById("data").value;
    const horaInicio = document.getElementById("horaInicio").value;
    const horaFim = document.getElementById("horaFim").value;

    if (!titulo || !data || !horaInicio || !horaFim) {
      alert("Preencha todos os campos!");
      return;
    }

    await addDoc(collection(db, "reunioes"), {
      titulo,
      data,
      horaInicio,
      horaFim,
      organizador: usuarioLogado.usuario
    });

    reuniaoForm.reset();
    carregarReunioes();
  });

  async function carregarReunioes() {
    listaReunioes.innerHTML = "";
    const query = await getDocs(collection(db, "reunioes"));
    query.forEach(docSnap => {
      const reuniao = docSnap.data();
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${reuniao.titulo}</td>
        <td>${reuniao.organizador}</td>
        <td>${reuniao.data}</td>
        <td>${reuniao.horaInicio}</td>
        <td>${reuniao.horaFim}</td>
        <td>
          ${usuarioLogado.tipo === "ADM" ? `
            <button onclick="editarReuniao('${docSnap.id}', '${reuniao.titulo}')">Editar</button>
            <button onclick="excluirReuniao('${docSnap.id}')">Excluir</button>
          ` : ""}
        </td>
      `;
      listaReunioes.appendChild(tr);
    });
  }

  window.editarReuniao = async (id, tituloAtual) => {
    const novoTitulo = prompt("Novo título:", tituloAtual);
    if (novoTitulo) {
      await updateDoc(doc(db, "reunioes", id), { titulo: novoTitulo });
      carregarReunioes();
    }
  };

  window.excluirReuniao = async (id) => {
    if (confirm("Tem certeza que deseja excluir esta reunião?")) {
      await deleteDoc(doc(db, "reunioes", id));
      carregarReunioes();
    }
  };

  carregarReunioes();

  // ================= Usuários (ADM) =================
  const listaUsuarios = document.getElementById("usuarios-list");
  if (usuarioLogado.tipo === "ADM") {
    async function carregarUsuarios() {
      listaUsuarios.innerHTML = "";
      const query = await getDocs(collection(db, "usuarios"));
      query.forEach(docSnap => {
        const user = docSnap.data();
        const tr = document.createElement("tr");

        let acoes = `
          <button onclick="excluirUsuario('${docSnap.id}')">Excluir</button>
        `;

        if (user.tipo !== "ADM") {
          acoes += `<button onclick="promoverADM('${docSnap.id}')">Promover ADM</button>`;
        }

        tr.innerHTML = `
          <td>${user.usuario}</td>
          <td>${user.tipo}</td>
          <td>${acoes}</td>
        `;
        listaUsuarios.appendChild(tr);
      });
    }

    window.excluirUsuario = async (id) => {
      if (confirm("Excluir este usuário?")) {
        await deleteDoc(doc(db, "usuarios", id));
        carregarUsuarios();
      }
    };

    window.promoverADM = async (id) => {
      await updateDoc(doc(db, "usuarios", id), { tipo: "ADM" });
      carregarUsuarios();
    };

    carregarUsuarios();
  }
}

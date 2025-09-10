// Importando Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
  getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  sendPasswordResetEmail, signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
  getFirestore, doc, setDoc, getDoc, addDoc, updateDoc, deleteDoc,
  collection, query, where, getDocs, onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Config Firebase (substitua pelo seu)
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_PROJETO.firebaseapp.com",
  projectId: "SEU_PROJETO",
  storageBucket: "SEU_PROJETO.appspot.com",
  messagingSenderId: "SEU_ID",
  appId: "SUA_APP_ID"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ===== LOGIN =====
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const identifier = document.getElementById("loginIdentifier").value.trim();
  const password = document.getElementById("loginPassword").value;
  try {
    let emailToLogin = identifier;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(identifier)) {
      const usernameLower = identifier.toLowerCase();
      const q = query(collection(db, "usuarios"), where("usuario", "==", usernameLower));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0].data();
        emailToLogin = userDoc.email;
      } else {
        alert("Usuário não encontrado!");
        return;
      }
    }
    const userCredential = await signInWithEmailAndPassword(auth, emailToLogin, password);
    const user = userCredential.user;
    const userDoc = await getDoc(doc(db, "usuarios", user.uid));
    if (!userDoc.exists()) {
      alert("Usuário sem perfil definido!");
      return;
    }
    const userData = userDoc.data();
    localStorage.setItem("userData", JSON.stringify(userData));
    window.location.href = "home.html";
  } catch (error) {
    alert("Erro no login: " + error.message);
  }
});

// ===== CADASTRO =====
document.getElementById("registerForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const usuario = document.getElementById("registerUser").value.trim().toLowerCase();
  const email = document.getElementById("registerEmail").value.trim();
  const senha = document.getElementById("registerPassword").value;
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
    const user = userCredential.user;
    await setDoc(doc(db, "usuarios", user.uid), {
      usuario: usuario,
      email: email,
      tipo: "USER"
    });
    alert("Usuário cadastrado com sucesso!");
    window.location.href = "index.html";
  } catch (error) {
    alert("Erro ao cadastrar: " + error.message);
  }
});

// ===== RESET SENHA =====
document.getElementById("resetForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("resetEmail").value.trim();
  try {
    await sendPasswordResetEmail(auth, email);
    alert("Link de recuperação enviado para: " + email);
    window.location.href = "index.html";
  } catch (error) {
    alert("Erro ao enviar link: " + error.message);
  }
});

// ===== LOGOFF =====
document.getElementById("logoffBtn")?.addEventListener("click", async () => {
  await signOut(auth);
  localStorage.clear();
  window.location.href = "index.html";
});

// ===== HOME (Reuniões + Usuários) =====
if (window.location.pathname.includes("home.html")) {
  const userData = JSON.parse(localStorage.getItem("userData"));
  if (!userData) {
    window.location.href = "index.html";
  }

  document.getElementById("welcomeUser").textContent = `🎉 Bem-vindo, ${userData.usuario || userData.email}`;

  const listaReunioes = document.getElementById("listaReunioes");
  const listaUsuarios = document.getElementById("listaUsuarios");
  const reservaForm = document.getElementById("reservaForm");

  // Cadastrar reunião
  reservaForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const titulo = document.getElementById("titulo").value;
    const data = document.getElementById("data").value;
    const horaInicio = document.getElementById("horaInicio").value;
    const horaFim = document.getElementById("horaFim").value;
    await addDoc(collection(db, "reunioes"), {
      titulo,
      data,
      horaInicio,
      horaFim,
      organizador: userData.usuario || userData.email
    });
    reservaForm.reset();
  });

  // Listar reuniões em tempo real
  onSnapshot(collection(db, "reunioes"), (snapshot) => {
    listaReunioes.innerHTML = "";
    snapshot.forEach((docSnap) => {
      const r = docSnap.data();
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${r.titulo}</td>
        <td>${r.organizador}</td>
        <td>${r.data}</td>
        <td>${r.horaInicio}</td>
        <td>${r.horaFim}</td>
        <td>
          ${userData.tipo === "ADM" ? `
            <button onclick="editarReuniao('${docSnap.id}')">Editar</button>
            <button onclick="excluirReuniao('${docSnap.id}')">Excluir</button>
          ` : ""}
        </td>
      `;
      listaReunioes.appendChild(tr);
    });
  });

  // Listar usuários
  onSnapshot(collection(db, "usuarios"), (snapshot) => {
    listaUsuarios.innerHTML = "";
    snapshot.forEach((docSnap) => {
      const u = docSnap.data();
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${u.usuario}</td>
        <td>${u.email}</td>
        <td>${u.tipo}</td>
        <td>
          ${userData.tipo === "ADM" ? `
            <button onclick="promoverADM('${docSnap.id}')">Tornar ADM</button>
            <button onclick="excluirUsuario('${docSnap.id}')">Excluir</button>
          ` : ""}
        </td>
      `;
      listaUsuarios.appendChild(tr);
    });
  });

  // Funções ADM
  window.excluirReuniao = async (id) => {
    await deleteDoc(doc(db, "reunioes", id));
  };

  window.promoverADM = async (uid) => {
    await updateDoc(doc(db, "usuarios", uid), { tipo: "ADM" });
  };

  window.excluirUsuario = async (uid) => {
    await deleteDoc(doc(db, "usuarios", uid));
  };
}

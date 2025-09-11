// ===============================
// Import Firebase SDK
// ===============================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail, 
  signOut 
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

// ===============================
// Configuração Firebase
// ===============================
const firebaseConfig = {
  apiKey: "AIzaSyD2tV3I2rhTR80HDbrqqQ6OHWD78EJ2-eU",
  authDomain: "agas-rooms-organizer.firebaseapp.com",
  projectId: "agas-rooms-organizer",
  storageBucket: "agas-rooms-organizer.appspot.com", // corrigido
  messagingSenderId: "101093561086",
  appId: "1:101093561086:web:967b2829508ab589fecbaf",
  measurementId: "G-JC4Y4PD3YV"
};

// Inicialização
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ===============================
// Cadastro de Usuário
// ===============================
export async function registerUser(usuario, email, senha) {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, senha);
    await setDoc(doc(db, "usuarios", cred.user.uid), {
      usuario: usuario,
      email: email,
      tipo: "Usuário"
    });
    alert("Usuário cadastrado com sucesso!");
    window.location.href = "index.html";
  } catch (e) {
    alert("Erro no cadastro: " + e.message);
  }
}

// ===============================
// Login de Usuário
// ===============================
export async function loginUser(email, senha) {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, senha);
    const q = await getDocs(collection(db, "usuarios"));
    let userData = null;

    q.forEach(docSnap => {
      if (docSnap.data().email === email) {
        userData = { id: docSnap.id, ...docSnap.data() };
      }
    });

    if (!userData) {
      alert("Usuário não encontrado no banco.");
      return;
    }

    sessionStorage.setItem("usuario", JSON.stringify(userData));
    window.location.href = "home.html";
  } catch (e) {
    alert("Erro no login: " + e.message);
  }
}

// ===============================
// Recuperar Senha
// ===============================
export async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email);
    alert("E-mail de recuperação enviado!");
  } catch (e) {
    alert("Erro ao recuperar senha: " + e.message);
  }
}

// ===============================
// Logout
// ===============================
export async function logoutUser() {
  await signOut(auth);
  sessionStorage.clear();
  window.location.href = "index.html";
}

// ===============================
// Reuniões
// ===============================
export async function agendarReuniao(titulo, data, inicio, fim, organizador) {
  try {
    await addDoc(collection(db, "reunioes"), {
      titulo,
      data,
      inicio,
      fim,
      organizador
    });
    alert("Reunião agendada com sucesso!");
  } catch (e) {
    alert("Erro ao agendar reunião: " + e.message);
  }
}

export function carregarReunioes(callback) {
  onSnapshot(collection(db, "reunioes"), (snapshot) => {
    const reunioes = [];
    snapshot.forEach((doc) => {
      reunioes.push({ id: doc.id, ...doc.data() });
    });
    callback(reunioes);
  });
}

export async function editarReuniao(id, dados) {
  try {
    await updateDoc(doc(db, "reunioes", id), dados);
    alert("Reunião atualizada!");
  } catch (e) {
    alert("Erro ao editar: " + e.message);
  }
}

export async function excluirReuniao(id) {
  try {
    await deleteDoc(doc(db, "reunioes", id));
    alert("Reunião excluída!");
  } catch (e) {
    alert("Erro ao excluir: " + e.message);
  }
}

// ===============================
// Usuários (somente ADM)
// ===============================
export async function carregarUsuarios(callback) {
  onSnapshot(collection(db, "usuarios"), (snapshot) => {
    const usuarios = [];
    snapshot.forEach((doc) => {
      usuarios.push({ id: doc.id, ...doc.data() });
    });
    callback(usuarios);
  });
}

export async function promoverAdm(id) {
  await updateDoc(doc(db, "usuarios", id), { tipo: "ADM" });
}

export async function redefinirSenhaUsuario(email) {
  await sendPasswordResetEmail(auth, email);
}

export async function excluirUsuario(id) {
  await deleteDoc(doc(db, "usuarios", id));
}

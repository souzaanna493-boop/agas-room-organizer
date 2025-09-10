// Importando Firebase SDKs
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
  doc, 
  setDoc, 
  getDoc, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  collection 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD2tV3I2rhTR80HDbrqqQ6OHWD78EJ2-eU",
  authDomain: "agas-rooms-organizer.firebaseapp.com",
  projectId: "agas-rooms-organizer",
  storageBucket: "agas-rooms-organizer.firebasestorage.app",
  messagingSenderId: "101093561086",
  appId: "1:101093561086:web:967b2829508ab589fecbaf",
  measurementId: "G-JC4Y4PD3YV"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);   // ✅ Authentication
const db = getFirestore(app); // ✅ Firestore

// ====================== FUNÇÕES ======================

// Registrar usuário
export async function registerUser(email, senha, usuario, tipo) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
    const user = userCredential.user;

    // Salva dados no Firestore
    await setDoc(doc(db, "usuarios", user.uid), {
      usuario,
      email,
      tipo
    });

    alert("Usuário registrado com sucesso!");
    window.location.href = "index.html";
  } catch (error) {
    alert("Erro ao registrar: " + error.message);
  }
}

// Login
export async function loginUser(email, senha) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, senha);
    const user = userCredential.user;

    // Busca os dados no Firestore
    const userDoc = await getDoc(doc(db, "usuarios", user.uid));

    if (userDoc.exists()) {
      localStorage.setItem("usuarioLogado", JSON.stringify(userDoc.data()));
      window.location.href = "home.html"; // Vai para a Home
    } else {
      alert("Usuário não encontrado no banco de dados.");
    }
  } catch (error) {
    alert("Erro ao logar: " + error.message);
  }
}

// Recuperar senha
export async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email);
    alert("Link de redefinição enviado para o e-mail.");
  } catch (error) {
    alert("Erro ao recuperar senha: " + error.message);
  }
}

// Logout
export async function logoutUser() {
  await signOut(auth);
  localStorage.removeItem("usuarioLogado");
  window.location.href = "index.html";
}

// ====================== REUNIÕES ======================

// Agendar reunião
export async function agendarReuniao(titulo, data, horaInicio, horaFim, organizador) {
  try {
    await addDoc(collection(db, "reunioes"), {
      titulo,
      data,
      horaInicio,
      horaFim,
      organizador
    });
    alert("Reunião agendada com sucesso!");
    carregarReunioes();
  } catch (error) {
    alert("Erro ao agendar: " + error.message);
  }
}

// Carregar reuniões
export async function carregarReunioes() {
  const querySnapshot = await getDocs(collection(db, "reunioes"));
  const lista = document.getElementById("lista-reunioes");
  if (!lista) return;

  lista.innerHTML = "";
  querySnapshot.forEach((docSnap) => {
    const reuniao = docSnap.data();
    const li = document.createElement("li");
    li.textContent = `${reuniao.titulo} - ${reuniao.data} (${reuniao.horaInicio} às ${reuniao.horaFim})`;
    lista.appendChild(li);
  });
}

// Importar Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Configuração do Firebase (copiada do seu projeto)
const firebaseConfig = {
  apiKey: "AIzaSyD2tV3I2rhTR80HDbrqqQ6OHWD78EJ2-eU",
  authDomain: "agas-rooms-organizer.firebaseapp.com",
  projectId: "agas-rooms-organizer",
  storageBucket: "agas-rooms-organizer.firebasestorage.app",
  messagingSenderId: "101093561086",
  appId: "1:101093561086:web:967b2829508ab589fecbaf",
  measurementId: "G-JC4Y4PD3YV"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// === LOGIN ===
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const senha = document.getElementById("loginSenha").value;

  try {
    // Autenticar no Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, senha);
    const user = userCredential.user;

    // Buscar dados extras no Firestore
    const userDoc = await getDoc(doc(db, "usuarios", user.uid));
    if (userDoc.exists()) {
      const dados = userDoc.data();
      localStorage.setItem("usuarioLogado", JSON.stringify(dados));
      window.location.href = "home.html";
    } else {
      alert("Usuário autenticado, mas não encontrado no banco Firestore!");
    }
  } catch (error) {
    alert("Erro ao logar: " + error.message);
  }
});

// === CRIAR CONTA ===
document.getElementById("cadastroForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("cadastroEmail").value;
  const senha = document.getElementById("cadastroSenha").value;
  const usuario = document.getElementById("cadastroUsuario").value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
    const user = userCredential.user;

    // Salvar dados extras no Firestore
    await setDoc(doc(db, "usuarios", user.uid), {
      email: email,
      usuario: usuario,
      tipo: "Usuário" // por padrão, novo usuário é normal
    });

    alert("Conta criada com sucesso!");
    window.location.href = "index.html";
  } catch (error) {
    alert("Erro ao criar conta: " + error.message);
  }
});

// === RECUPERAR SENHA ===
document.getElementById("recuperarForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("recuperarEmail").value;

  try {
    await sendPasswordResetEmail(auth, email);
    alert("E-mail de recuperação enviado!");
  } catch (error) {
    alert("Erro ao recuperar senha: " + error.message);
  }
});

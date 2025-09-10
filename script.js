// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, confirmPasswordReset } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_PROJECT_ID.firebaseapp.com",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_PROJECT_ID.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ---------------- LOGIN ----------------
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const emailUser = document.getElementById("loginUser").value;
  const senha = document.getElementById("loginPass").value;

  try {
    await signInWithEmailAndPassword(auth, emailUser, senha);
    alert("✅ Login bem-sucedido!");
    window.location.href = "home.html"; // coloque sua página principal aqui
  } catch (error) {
    alert("❌ Erro ao logar: " + error.message);
  }
});

// ---------------- REGISTRO ----------------
document.getElementById("registerForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const user = document.getElementById("regUser").value;
  const email = document.getElementById("regEmail").value;
  const senha = document.getElementById("regPass").value;

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, senha);
    await setDoc(doc(db, "usuarios", cred.user.uid), {
      usuario: user,
      email: email,
      tipo: "usuario"
    });
    alert("✅ Usuário registrado!");
    window.location.href = "index.html";
  } catch (error) {
    alert("❌ Erro ao registrar: " + error.message);
  }
});

// ---------------- RESET PASSWORD ----------------
document.getElementById("resetForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("resetEmail").value;

  try {
    await sendPasswordResetEmail(auth, email);
    alert("📩 Link de redefinição enviado para o e-mail.");
    window.location.href = "index.html";
  } catch (error) {
    alert("❌ Erro: " + error.message);
  }
});

// ---------------- NOVA SENHA ----------------
document.getElementById("newPasswordForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const urlParams = new URLSearchParams(window.location.search);
  const oobCode = urlParams.get("oobCode");

  const novaSenha = document.getElementById("novaSenha").value;
  const confirmarSenha = document.getElementById("confirmarSenha").value;

  if (novaSenha !== confirmarSenha) {
    alert("⚠️ Senhas não coincidem!");
    return;
  }

  try {
    await confirmPasswordReset(auth, oobCode, novaSenha);
    alert("✅ Senha alterada com sucesso!");
    window.location.href = "index.html";
  } catch (error) {
    alert("❌ Erro ao redefinir senha: " + error.message);
  }
});

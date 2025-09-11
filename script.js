// Importando Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, 
         createUserWithEmailAndPassword, 
         signInWithEmailAndPassword, 
         sendPasswordResetEmail, 
         confirmPasswordReset,
         onAuthStateChanged,
         signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, setDoc, getDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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

// ================== LOGIN ==================
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const loginInput = document.getElementById("loginInput").value.trim();
    const password = document.getElementById("passwordInput").value;

    try {
      // Login sempre feito com email (se digitou usuário, busca email)
      let email = loginInput;
      if (!loginInput.includes("@")) {
        const userDoc = await getDoc(doc(db, "usuarios", loginInput.toLowerCase()));
        if (userDoc.exists()) {
          email = userDoc.data().email;
        } else {
          alert("Usuário não encontrado");
          return;
        }
      }

      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = "home.html";
    } catch (error) {
      alert("Erro no login: " + error.message);
    }
  });
}

// ================== CADASTRO ==================
const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("usernameRegister").value.trim();
    const email = document.getElementById("emailRegister").value.trim();
    const password = document.getElementById("passwordRegister").value;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Salva dados no Firestore
      await setDoc(doc(db, "usuarios", username.toLowerCase()), {
        username: username,
        email: email,
        admin: false
      });

      alert("Usuário cadastrado com sucesso!");
      window.location.href = "index.html";
    } catch (error) {
      alert("Erro no cadastro: " + error.message);
    }
  });
}

// ================== RECUPERAÇÃO DE SENHA ==================
const resetForm = document.getElementById("resetForm");
if (resetForm) {
  resetForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("resetEmail").value.trim();

    try {
      await sendPasswordResetEmail(auth, email);
      alert("Link de recuperação enviado para o e-mail.");
    } catch (error) {
      alert("Erro ao enviar e-mail: " + error.message);
    }
  });
}

// ================== NOVA SENHA ==================
const newPasswordForm = document.getElementById("newPasswordForm");
if (newPasswordForm) {
  newPasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (newPassword !== confirmPassword) {
      alert("As senhas não coincidem!");
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const oobCode = params.get("oobCode");

    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      alert("Senha alterada com sucesso!");
      window.location.href = "index.html";
    } catch (error) {
      alert("Erro ao redefinir senha: " + error.message);
    }
  });
}

// ================== LOGOUT ==================
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "index.html";
  });
}

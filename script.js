// Importando Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
  getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  sendPasswordResetEmail, signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
  getFirestore, doc, setDoc, getDoc, query, where, collection, getDocs 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Configuração Firebase (substitua pelo seu config do console Firebase)
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

    // Verifica se é email válido
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(identifier)) {
      // Se for "usuário", converte para minúsculo
      const usernameLower = identifier.toLowerCase();

      // Buscar no Firestore pelo campo "usuario"
      const q = query(collection(db, "usuarios"), where("usuario", "==", usernameLower));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0].data();
        emailToLogin = userDoc.email; // pega email do Firestore
      } else {
        alert("Usuário não encontrado!");
        return;
      }
    }

    // Faz login com email e senha
    const userCredential = await signInWithEmailAndPassword(auth, emailToLogin, password);
    const user = userCredential.user;

    // Busca dados extras do Firestore
    const userDoc = await getDoc(doc(db, "usuarios", user.uid));
    if (!userDoc.exists()) {
      alert("Usuário sem perfil definido!");
      return;
    }

    const userData = userDoc.data();
    localStorage.setItem("userData", JSON.stringify(userData));

    // Vai para home
    window.location.href = "home.html";

  } catch (error) {
    console.error("Erro no login:", error);
    alert("Erro ao fazer login: " + error.message);
  }
});

// ===== CADASTRO =====
document.getElementById("registerForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const usuario = document.getElementById("registerUser").value.trim().toLowerCase(); // salva sempre em minúsculo
  const email = document.getElementById("registerEmail").value.trim();
  const senha = document.getElementById("registerPassword").value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
    const user = userCredential.user;

    await setDoc(doc(db, "usuarios", user.uid), {
      usuario: usuario,
      email: email,
      tipo: "USER" // padrão: usuário comum
    });

    alert("Usuário cadastrado com sucesso!");
    window.location.href = "index.html";
  } catch (error) {
    console.error(error);
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
    console.error(error);
    alert("Erro ao enviar link: " + error.message);
  }
});

// ===== LOGOFF =====
document.getElementById("logoffBtn")?.addEventListener("click", async () => {
  await signOut(auth);
  localStorage.clear();
  window.location.href = "index.html";
});

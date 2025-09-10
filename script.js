// ================= Firebase Config ==================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

// Inicialização
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ================= Funções de Autenticação ==================
export async function loginUser(email, senha) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, senha);
    const user = userCredential.user;

    // Buscar tipo do usuário no Firestore
    const querySnapshot = await getDocs(collection(db, "usuarios"));
    let usuarioLogado = null;

    querySnapshot.forEach((doc) => {
      const dados = doc.data();
      if (dados.email === email) {
        usuarioLogado = {
          usuario: dados.usuario,
          email: dados.email,
          tipo: dados.tipo
        };
      }
    });

    if (!usuarioLogado) throw new Error("Usuário não encontrado no Firestore.");

    // Salvar no localStorage
    localStorage.setItem("usuarioLogado", JSON.stringify(usuarioLogado));

    // Redirecionar
    window.location.href = "home.html";
  } catch (error) {
    alert("Erro ao logar: " + error.message);
  }
}

export async function registerUser(email, senha, usuario) {
  try {
    await createUserWithEmailAndPassword(auth, email, senha);
    await addDoc(collection(db, "usuarios"), {
      usuario,
      email,
      tipo: "USUARIO"
    });
    alert("Usuário cadastrado com sucesso!");
    window.location.href = "index.html";
  } catch (error) {
    alert("Erro ao cadastrar: " + error.message);
  }
}

export async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email);
    alert("E-mail de redefinição enviado!");
  } catch (error) {
    alert("Erro ao enviar redefinição: " + error.message);
  }
}

export async function logoutUser() {
  await signOut(auth);
  localStorage.removeItem("usuarioLogado");
  window.location.href = "index.html";
}

// ================= Funções de Reuniões ==================
export async function agendarReuniao(titulo, data, horaInicio, horaFim, organizador) {
  try {
    await addDoc(collection(db, "reunioes"), {
      titulo,
      data,
      horaInicio,
      horaFim,
      organizador
    });
    alert("Reunião agendada!");
    window.location.reload();
  } catch (error) {
    alert("Erro ao agendar reunião: " + error.message);
  }
}

export async function carregarReunioes(isAdmin) {
  try {
    const lista = document.getElementById("lista-reunioes");
    lista.innerHTML = "";

    const querySnapshot = await getDocs(collection(db, "reunioes"));
    querySnapshot.forEach((docSnap) => {
      const reuniao = docSnap.data();
      const li = document.createElement("li");

      li.innerHTML = `
        <strong>${reuniao.titulo}</strong> <br>
        Data: ${reuniao.data} <br>
        Início: ${reuniao.horaInicio} - Fim: ${reuniao.horaFim} <br>
        Organizador: ${reuniao.organizador}
      `;

      // Apenas ADM pode editar/excluir
      if (isAdmin) {
        const btnEditar = document.createElement("button");
        btnEditar.innerText = "Editar";
        btnEditar.onclick = async () => {
          const novoTitulo = prompt("Novo título:", reuniao.titulo);
          if (novoTitulo) {
            await updateDoc(doc(db, "reunioes", docSnap.id), { titulo: novoTitulo });
            alert("Reunião atualizada!");
            window.location.reload();
          }
        };

        const btnExcluir = document.createElement("button");
        btnExcluir.innerText = "Excluir";
        btnExcluir.onclick = async () => {
          if (confirm("Deseja excluir esta reunião?")) {
            await deleteDoc(doc(db, "reunioes", docSnap.id));
            alert("Reunião excluída!");
            window.location.reload();
          }
        };

        li.appendChild(btnEditar);
        li.appendChild(btnExcluir);
      }

      lista.appendChild(li);
    });
  } catch (error) {
    alert("Erro ao carregar reuniões: " + error.message);
  }
}

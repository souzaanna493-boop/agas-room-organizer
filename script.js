// ===== LOGIN =====
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const inputUserOrEmail = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    try {
        let emailToLogin = inputUserOrEmail;

        // Verifica se é um email válido
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(inputUserOrEmail)) {
            // Se não for email, procura pelo "usuario" no Firestore
            const q = query(collection(db, "usuarios"), where("usuario", "==", inputUserOrEmail));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const userDoc = querySnapshot.docs[0].data();
                emailToLogin = userDoc.email; // pega o email do Firestore
            } else {
                alert("Usuário não encontrado!");
                return;
            }
        }

        // Faz login com o email encontrado e senha
        const userCredential = await signInWithEmailAndPassword(auth, emailToLogin, password);
        const user = userCredential.user;

        // Buscar os dados no Firestore para saber se é ADM ou comum
        const userDoc = await getDoc(doc(db, "usuarios", user.uid));
        const userData = userDoc.data();

        // Salvar dados no localStorage (pra exibir no home)
        localStorage.setItem("userData", JSON.stringify(userData));

        // Redirecionar para home
        window.location.href = "home.html";

    } catch (error) {
        console.error("Erro ao logar:", error);
        alert("Erro ao fazer login: " + error.message);
    }
});

/* =======================
   SISTEMA AGAS ROOM ORGANIZER
   Lógica em JavaScript
======================= */

// Banco de dados em memória (simulação temporária)
let usuarios = [
    { usuario: "adm", senha: "123", tipo: "ADM" }
];

let reunioes = [];
let usuarioLogado = null;

/* =======================
   LOGIN
======================= */
function login(event) {
    event.preventDefault();

    const user = document.getElementById("loginUser").value.trim().toLowerCase();
    const pass = document.getElementById("loginPass").value.trim();

    const usuario = usuarios.find(u => u.usuario.toLowerCase() === user && u.senha === pass);

    if (usuario) {
        usuarioLogado = usuario;
        mostrarPagina("home");
        atualizarInterface();
    } else {
        alert("Usuário ou senha incorretos!");
    }
}

/* =======================
   LOGOUT
======================= */
function logout() {
    usuarioLogado = null;
    mostrarPagina("login");
}

/* =======================
   CADASTRO
======================= */
function cadastrar(event) {
    event.preventDefault();

    const user = document.getElementById("cadUser").value.trim();
    const pass = document.getElementById("cadPass").value.trim();

    if (!user || !pass) {
        alert("Preencha todos os campos!");
        return;
    }

    if (usuarios.some(u => u.usuario.toLowerCase() === user.toLowerCase())) {
        alert("Esse usuário já existe!");
        return;
    }

    usuarios.push({ usuario: user, senha: pass, tipo: "Usuário" });
    alert("Cadastro realizado com sucesso!");
    mostrarPagina("login");
}

/* =======================
   AGENDAR REUNIÃO
======================= */
function agendarReuniao(event) {
    event.preventDefault();

    const titulo = document.getElementById("tituloReuniao").value;
    const data = document.getElementById("dataReuniao").value;
    const inicio = document.getElementById("horaInicio").value;
    const fim = document.getElementById("horaFim").value;

    if (!titulo || !data || !inicio || !fim) {
        alert("Preencha todos os campos!");
        return;
    }

    reunioes.push({
        titulo,
        organizador: usuarioLogado.usuario,
        data,
        inicio,
        fim
    });

    atualizarReunioes();
    document.getElementById("formReuniao").reset();
}

/* =======================
   LISTAR REUNIÕES
======================= */
function atualizarReunioes() {
    const tbody = document.getElementById("listaReunioes");
    tbody.innerHTML = "";

    reunioes.forEach((r, i) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${r.titulo}</td>
            <td>${r.organizador}</td>
            <td>${r.data}</td>
            <td>${r.inicio}</td>
            <td>${r.fim}</td>
            <td>
                ${usuarioLogado.tipo === "ADM" ? `
                    <button class="btn-secondary" onclick="editarReuniao(${i})">Editar</button>
                    <button class="btn-danger" onclick="excluirReuniao(${i})">Excluir</button>
                ` : `-`}
            </td>
        `;

        tbody.appendChild(row);
    });
}

function excluirReuniao(index) {
    reunioes.splice(index, 1);
    atualizarReunioes();
}

/* =======================
   GERENCIAR USUÁRIOS (ADM)
======================= */
function atualizarUsuarios() {
    const tbody = document.getElementById("listaUsuarios");
    tbody.innerHTML = "";

    usuarios.forEach((u, i) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${u.usuario}</td>
            <td>${u.tipo}</td>
            <td>
                ${usuarioLogado.tipo === "ADM" && u.usuario !== "adm" ? `
                    <button class="btn-danger" onclick="excluirUsuario(${i})">Excluir</button>
                    <button class="btn-secondary" onclick="promoverAdm(${i})">Promover ADM</button>
                ` : `Protegido`}
            </td>
        `;

        tbody.appendChild(row);
    });
}

function excluirUsuario(index) {
    usuarios.splice(index, 1);
    atualizarUsuarios();
}

function promoverAdm(index) {
    usuarios[index].tipo = "ADM";
    atualizarUsuarios();
}

/* =======================
   PÁGINAS
======================= */
function mostrarPagina(pagina) {
    document.querySelectorAll(".page").forEach(p => p.style.display = "none");
    document.getElementById(pagina).style.display = "block";
}

/* =======================
   INTERFACE
======================= */
function atualizarInterface() {
    document.getElementById("usuarioLogado").innerText = `Usuário: ${usuarioLogado.usuario} (${usuarioLogado.tipo})`;
    atualizarReunioes();
    atualizarUsuarios();
}

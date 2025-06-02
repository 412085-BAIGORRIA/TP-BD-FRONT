const baseUrl = "http://localhost:8080";

async function register() {
    const username = document.getElementById("register-username").value;
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;
    const country = document.getElementById("register-country").value;

    const res = await fetch(`${baseUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, country })
    });

    if (res.ok) {
        alert("Registro exitoso. Por favor inicia sesión.");
        window.location.href = "login.html";
    } else {
        alert("Error en el registro. Intenta nuevamente.");
    }
}

// Llenar la lista de países al cargar
async function cargarPaises() {
    const paises = new Intl.DisplayNames(['es'], { type: 'region' });
    const select = document.getElementById("register-country");

    const codes = await fetch("https://flagcdn.com/en/codes.json")
        .then(res => res.ok ? res.json() : [])
        .catch(() => []);

    Object.keys(codes).sort().forEach(code => {
        const option = document.createElement("option");
        option.value = code.toUpperCase();
        option.textContent = paises.of(code.toUpperCase()) || code.toUpperCase();
        select.appendChild(option);
    });
}

cargarPaises();
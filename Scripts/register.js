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
        .then(res => res.ok ? res.json() : {})
        .catch(() => ({}));

    Object.keys(codes).sort().forEach(code => {
        const codeUpper = code.toUpperCase();

        // Filtrar: solo códigos de 2 letras (ISO 3166-1 alpha-2)
        if (codeUpper.length !== 2) return;

        // Intentar obtener el nombre, si falla, saltar
        let nombre;
        try {
            nombre = paises.of(codeUpper);
            if (!nombre) return; // No agregar si no tiene nombre
        } catch {
            return; // Código inválido, no agregar
        }

        const option = document.createElement("option");
        option.value = codeUpper;
        option.textContent = nombre;
        select.appendChild(option);
    });
}


cargarPaises();
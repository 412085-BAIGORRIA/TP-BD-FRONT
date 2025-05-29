const API_KEY = "826664005a5966d64d967b70dcc87724";
const API_URL_POPULARES = `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=es&page=1`;

async function traerPeliculasPopulares() {
    const contenedor = document.getElementById("listado-populares");

    try {
        const respuesta = await fetch(API_URL_POPULARES);
        const datos = await respuesta.json();
        const peliculas = datos.results;

        contenedor.innerHTML = "";

        peliculas.slice(0, 12).forEach(pelicula => {
            const div = document.createElement("div");
            div.classList.add("col");

            div.innerHTML = `
                <div class="card h-100 shadow-sm">
                    <img src="https://image.tmdb.org/t/p/w300${pelicula.poster_path}" class="card-img-top" alt="${pelicula.title}">
                    <div class="card-body">
                        <h5 class="card-title">${pelicula.title}</h5>
                    </div>
                </div>
            `;
            contenedor.appendChild(div);
        });

    } catch (error) {
        console.error("Error al cargar películas populares:", error);
        contenedor.innerHTML = `<p class="text-danger">No se pudieron cargar las películas populares.</p>`;
    }
}

//const baseUrl = "https://tpbdii-backend.onrender.com";

const baseUrl = "http://localhost:8080";
let token = localStorage.getItem("token") || null;

// Verificar autenticación al cargar la página principal
if (window.location.pathname.endsWith("index.html")) {
    window.onload = () => {
        traerPeliculasPopulares();
        mostrarSeccion("populares");
        if (token) {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload.role === "ADMIN") {
                document.getElementById("admin-button").style.display = "block";
            }
            document.getElementById("login-nav-button").style.display = "none";
            document.getElementById("logout-button").style.display = "block";
            document.getElementById("search-panel").style.display = "block";
            cargarFavoritos();
            cargarRatings();
        }
    };
}

async function login() {
    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;

    const res = await fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    if (res.ok) {
        const data = await res.json();
        token = data.token;
        localStorage.setItem("token", token);

        // Redirigir a la página principal después del login
        window.location.href = "../index.html";
    } else {
        alert("Error en el login. Verifica tus credenciales.");
    }
}

async function register() {
    const username = document.getElementById("register-username").value;
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;

    const res = await fetch(`${baseUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password })
    });

    if (res.ok) {
        alert("Registro exitoso. Por favor inicia sesión.");
        // Redirigir a la página de login después del registro
        window.location.href = "login.html";
    } else {
        alert("Error en el registro. Intenta nuevamente.");
    }
}

function logout() {
    localStorage.removeItem("token");
    // Recargar la página para actualizar la UI
    window.location.href = "index.html";
}

async function buscarPeliculas() {
    const query = document.getElementById("query").value;
    const res = await fetch(`${baseUrl}/api/movies/search?query=${encodeURIComponent(query)}`);
    const data = await res.json();
    const results = document.getElementById("results");
    results.innerHTML = "";

    data.results.forEach(peli => {
        const card = document.createElement("div");
        card.className = "movie-card";
        card.classList.add("col");

        card.innerHTML = `
             <div class="col">
                <div class="card h-100 shadow-sm">
                    <img src="https://image.tmdb.org/t/p/w200${peli.poster_path}" class="card-img-top" alt="poster" width=300 height=300>
                    <div class="card-body d-flex flex-column bg-primary">
                        <h5 class="card-title">${peli.title} (${(peli.release_date || '').split('-')[0] || 'N/A'})</h5>
                        <p class="card-text text-truncate">${peli.overview || 'Sin descripción'}</p>
                        <div class="mt-auto">
                            <button onclick="agregarFavorito('${peli.id}')">❤️ Favorito</button>
                            <button id="quitar-${peli.imdbID}" disabled onclick="quitarFavorito('${peli.imdbID}')">❌ Quitar</button>
                            <select class="bg-success" onchange="puntuar('${peli.id}', this.value)">
                            <option value="">⭐ Puntuar</option>
                            ${[1,2,3,4,5].map(n => `<option class="bg-success" value="${n}">${n}</option>`).join("")}
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        `
        results.appendChild(card);
    });
}

async function agregarFavorito(movieId) {
    const res = await fetch(`${baseUrl}/api/user/favorite`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ movieId })
    });
    alert(res.ok ? "Agregado a favoritos" : "Error al agregar favorito");
    if (res.ok) cargarFavoritos();
}

async function quitarFavorito(movieId) {
    const res = await fetch(`${baseUrl}/api/user/favorite`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ movieId })
    });
    alert(res.ok ? "Quitado de favoritos" : "Error al quitar favorito");
    if (res.ok) cargarFavoritos();
}

async function puntuar(movieId, score) {
    if (!score) return;
    const res = await fetch(`${baseUrl}/api/user/rate`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ movieId, score: parseInt(score) })
    });
    alert(res.ok ? "Película puntuada" : "Error al puntuar");
    if (res.ok) cargarRatings();
}

async function cargarFavoritos() {
    const res = await fetch(`${baseUrl}/api/user/favorites`, {
        headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) {
        console.error("Error en la respuesta", res.status);
        return;
    }
    const data = await res.json();
    console.log("Respuesta de favoritos:", data);

    if (!Array.isArray(data)) {
        console.error("La respuesta no es un arreglo:", data);
        return;
    }

    const favs = data.map(f => JSON.parse(f));

    document.getElementById("favoritos").innerHTML = favs.map(pelicula => `
        <li style="display: flex; align-items: center; margin-bottom: 8px; flex-direction: column; padding: 20px; ">
            <img src="https://image.tmdb.org/t/p/w92${pelicula.poster_path}" 
                 alt="${pelicula.title}" 
                 style="width: 100px; height: auto; margin-right: 10px; border-radius: 4px;">
            <span>${pelicula.title}</span>
        </li>
    `).join("");
}

async function cargarRatings() {
    const res = await fetch(`${baseUrl}/api/user/ratings`, {
        headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) return;
    const ratings = await res.json();

    const ratingsList = document.getElementById("ratings");
    ratingsList.innerHTML = "Cargando...";

    const detalles = await Promise.all(ratings.map(async (r) => {
        const res = await fetch(`${baseUrl}/api/movies/${r.movieId}`);
        if (!res.ok) return `<li>Error cargando película ID ${r.movieId}</li>`;
        const peli = await res.json();

        return `
            <li style="display: flex; align-items: center; margin-bottom: 8px;">
                <img src="https://image.tmdb.org/t/p/w92${peli.poster_path}" 
                     alt="${peli.title}" 
                     style="width: 100px; height: auto; margin-right: 10px; border-radius: 4px;">
                <span><strong>${peli.title}</strong>: ${r.score}/5</span>
            </li>
        `;
    }));

    ratingsList.innerHTML = detalles.join("");
}

function mostrarSeccion(nombre) {
    const popularesPanel = document.getElementById("populares-panel");
    const buscarPanel = document.getElementById("search-panel");
    const favoritosPanel = document.getElementById("favoritos-panel");
    const puntuacionesPanel = document.getElementById("puntuaciones-panel");

    // Ocultar todos los paneles
    popularesPanel.style.display = "none";
    buscarPanel.style.display = "none";
    favoritosPanel.style.display = "none";
    puntuacionesPanel.style.display = "none";

    // Mostrar el panel que corresponda
    switch (nombre) {
        case "populares":
            popularesPanel.style.display = "block";
            break;
        case "buscar":
            buscarPanel.style.display = "block";
            break;
        case "favoritos":
            favoritosPanel.style.display = "block";
            break;
        case "puntuaciones":
            puntuacionesPanel.style.display = "block";
            break;
    }
}

async function cargarPeliculasPopulares() {
    try {
        const res = await fetch(`${baseUrl}/api/movies/popular`);
        const data = await res.json();
        const results = document.getElementById("results");
        results.innerHTML = "";

        data.results.forEach(peli => {
            const card = document.createElement("div");
            card.className = "movie-card";
            card.classList.add("col");

            card.innerHTML = `
                <div class="col">
                    <div class="card h-100 shadow-sm">
                        <img src="https://image.tmdb.org/t/p/w200${peli.poster_path}" class="card-img-top" alt="poster" width=300 height=300>
                        <div class="card-body d-flex flex-column bg-primary">
                            <h5 class="card-title">${peli.title} (${(peli.release_date || '').split('-')[0] || 'N/A'})</h5>
                            <p class="card-text text-truncate">${peli.overview || 'Sin descripción'}</p>
                            <div class="mt-auto">
                                <button onclick="agregarFavorito('${peli.id}')">❤️ Favorito</button>
                                <button onclick="quitarFavorito('${peli.id}')" disabled>❌ Quitar</button>
                                <select class="bg-success" onchange="puntuar('${peli.id}', this.value)">
                                <option value="">⭐ Puntuar</option>
                                ${[1,2,3,4,5].map(n => `<option class="bg-success" value="${n}">${n}</option>`).join("")}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            results.appendChild(card);
        });
    } catch (error) {
        console.error("Error al cargar películas populares:", error);
        document.getElementById("results").innerHTML = `<p class="text-danger">No se pudieron cargar las películas populares</p>`;
    }
}
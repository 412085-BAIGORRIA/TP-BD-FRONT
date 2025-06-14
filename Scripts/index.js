/*const API_KEY = "826664005a5966d64d967b70dcc87724";
const API_URL = `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=es&page=1`;

async function traerPeliculas(){

    const listado = document.getElementById("listado");

    try {
        const respuesta = await fetch(API_URL);
        const datos = await respuesta.json();
        const peliculas = datos.results;

        listado.innerHTML = '';

        for (let i = 0; i < 30 && i < peliculas.length; i++) {

            const pelicula = peliculas[i];
            const div = document.createElement("div");
            div.classList.add("col");

            div.innerHTML = `
             <div class="col">
                    <div class="card h-100 shadow-sm">
                        <img src="https://image.tmdb.org/t/p/w300${pelicula.poster_path}" class="card-img-top" alt="${pelicula.title}">
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title">T${pelicula.title}</h5>
                            <p class="card-text text-truncate">${pelicula.overview || 'Sin descripción disponible.'}</p>
                            <div class="mt-auto">
                                <p class="text-muted mb-1">⭐ ${pelicula.vote_average.toFixed(1)}</p>
                                <a href="pages/detalle.html?id=${pelicula.id}" class="btn btn-primary btn-sm">Ver detalles</a>
                            </div>
                        </div>
                    </div>
                </div>
        `;
            listado.appendChild(div);
        }
    }catch (error){
        console.error("Error al traer películas:", error);
        listado.innerHTML = `<p class="text-danger">No se pudieron cargar las películas. Intenta más tarde.</p>`;
    }

}

addEventListener('DOMContentLoaded', () => {
    traerPeliculas();
});*/

//const baseUrl = "https://tpbdii-backend.onrender.com";

const baseUrl = "http://localhost:8080";
let token = localStorage.getItem("token") || null;

window.onload = () => {
    if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.role === "ADMIN") {
            document.getElementById("admin-button").style.display = "inline-block";
        }
        document.getElementById("auth-panel").style.display = "none";
        document.getElementById("search-panel").style.display = "block";
        cargarFavoritos();
        cargarRatings();
    }
};

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
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.role === "ADMIN") {
            document.getElementById("admin-button").style.display = "inline-block";
        }
        document.getElementById("auth-panel").style.display = "none";
        document.getElementById("search-panel").style.display = "block";
        alert("Login exitoso");
        cargarFavoritos();
        cargarRatings();
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
        alert("Usuario registrado 🎉");
    } else {
        alert("Error al registrar ❌");
    }
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
                            <button onclick="quitarFavorito('${peli.id}')">❌ Quitar</button>
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
    if (!res.ok) return;
    const favs = await res.json();
    document.getElementById("favoritos").innerHTML = favs.map(f => `<li>${JSON.parse(f).title}</li>`).join("");
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
        const peli = await res.json();
        return `<li><strong>${peli.title}</strong>: ${r.score}/5</li>`;
    }));

    ratingsList.innerHTML = detalles.join("");
}

function logout() {
    localStorage.removeItem("token");
    token = null;
    document.getElementById("search-panel").style.display = "none";
    document.getElementById("auth-panel").style.display = "block";
    document.getElementById("results").innerHTML = "";
    document.getElementById("favoritos").innerHTML = "";
    document.getElementById("ratings").innerHTML = "";
    document.getElementById("admin-button").style.display = "none";
}
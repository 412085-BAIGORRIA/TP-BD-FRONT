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
            document.getElementById("profile-link").style.display = "block";

            cargarFavoritos();
            cargarRatings();
        }

        const searchInput = document.getElementById("buscar-peliculas");
        const suggestionList = document.getElementById("sugerencias-peliculas");
        const selectedMoviesList = document.getElementById("peliculas-seleccionadas");
        const form = document.getElementById("form-nueva-lista");

        let selectedMovies = [];

        // Debounce function to limit search frequency
        function debounce(func, delay) {
            let timeout;
            return function (...args) {
                clearTimeout(timeout);
                timeout = setTimeout(() => func.apply(this, args), delay);
            };
        }

        // Fetch movie suggestions
        const fetchMovieSuggestions = debounce(async (query) => {
            if (!query) {
                suggestionList.innerHTML = '';
                return;
            }

            try {
                const response = await fetch(`${baseUrl}/api/movies/search?query=${encodeURIComponent(query)}`);
                const movies = await response.json();

                suggestionList.innerHTML = '';
                movies.results.forEach(movie => {
                        const li = document.createElement("li");
                        li.textContent = movie.title;
                        li.dataset.id = movie.id;
                        li.addEventListener("click", () => addMovie(movie));
                        suggestionList.appendChild(li);
                    }
                );



            } catch (error) {
                console.error("Error fetching movies:", error);
            }
        }, 300);

        function addMovie(movie) {
            if (selectedMovies.find(m => m.id === movie.id)) return;

            selectedMovies.push(movie);
            const li = document.createElement("li");
            li.textContent = movie.title;
            selectedMoviesList.appendChild(li);
            suggestionList.innerHTML = '';
            searchInput.value = '';
        }

        searchInput.addEventListener("input", (e) => {
            fetchMovieSuggestions(e.target.value);
        });

        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const name = document.getElementById("lista-nombre").value.trim();
            const description = document.getElementById("lista-descripcion").value.trim();
            const tagsInput = document.getElementById("lista-tags").value.trim();
            const tags = tagsInput ? tagsInput.split(",").map(tag => tag.trim()) : [];

            const ownerId = null; // Replace with actual logic to get current user ID
            const postDate = new Date().toISOString();

            const movieList = {
                name,
                description,
                ownerId,
                postDate,
                movies: selectedMovies.map(m => m.id),
                tags,
                usersLikes: []
            };

            try {
                const response = await fetch(`${baseUrl}/api/movie-lists`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify(movieList)
                });

                if (response.ok) {
                    alert("Lista creada exitosamente");
                    form.reset();
                    selectedMovies = [];
                    selectedMoviesList.innerHTML = '';
                } else {
                    const errorData = await response.json();
                    alert(`Error al crear la lista: ${errorData.message || response.statusText}`);
                }
            } catch (error) {
                console.error("Error enviando la lista:", error);
                alert("Error de red al intentar crear la lista.");
            }
        });
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
                    <img id="img-card" src="https://image.tmdb.org/t/p/w200${peli.poster_path}" class="card-img-top img-fluid" alt="poster">
                    <div id="card-body" class="card-body d-flex flex-column">
                        <h5 class="card-title">${peli.title} (${(peli.release_date || '').split('-')[0] || 'N/A'})</h5>
                        <p class="card-text text-truncate" data-bs-toggle="tooltip" data-bs-placement="top" title="${peli.overview || 'Sin descripción'}">Ver descripcion</p>
                        <div class="mt-auto">
                            <button onclick="agregarFavorito('${peli.id}')">❤️ Favorito</button>
                            <button id="quitar-${peli.imdbID}" disabled onclick="quitarFavorito('${peli.imdbID}')">❌ Quitar</button>
                            <select class="bg-success rounded-pill mt-1 text-white" onchange="puntuar('${peli.id}', this.value)">
                            <option value="">⭐ Puntuar</option>
                            ${[1,2,3,4,5].map(n => `<option class="bg-success text-white" value="${n}">${n}</option>`).join("")}
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        `
        results.appendChild(card);
        document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => {
            new bootstrap.Tooltip(el);
        });
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
async function cargarFavoritosPorId(userId) {
    const res = await fetch(`${baseUrl}/api/user/${userId}/favorites`);
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

async function cargarRatingsPorId(userId) {
    const res = await fetch(`${baseUrl}/api/user/${userId}/ratings`);
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
    ratingsList.style.display = "block";
}

async function cargarListas(url) {
    const res = await fetch(`${baseUrl}${url}`);


    if (!res.ok) return;
    const listas = await res.json();

    const listaList = document.getElementById("listas");
    const mensaje = document.getElementById("listas-mensaje");

    if (listas.length === 0) {
        listaList.innerHTML = "";
        mensaje.style.display = "block";
        mensaje.textContent = "No se encontró ninguna lista con ese título.";
        return;
    } else {
        mensaje.style.display = "none";
    }

    listaList.innerHTML = "Cargando...";
    const listFragment = document.createDocumentFragment();

    for (const list of listas) {
        // Fetch user
        const usuarioRes = await fetch(`${baseUrl}/api/user/${list.ownerId}`);
        if (!usuarioRes.ok) continue;
        const usuario = await usuarioRes.json();

        // Fetch all movies concurrently
        const pelis = await Promise.all(list.movies.map(async (movieId) => {
            const movieRes = await fetch(`${baseUrl}/api/movies/${movieId}`);
            if (!movieRes.ok) return '';
            const peli = await movieRes.json();
            return `<img src="https://image.tmdb.org/t/p/w92${peli.poster_path}" alt="${peli.title}" title="${peli.title}">`;
        }));

        // Create list card
        const listCard = document.createElement('li');
        listCard.classList.add('movie-list-card');
        listCard.innerHTML = `
            <div class="list-header" >
                <h3>${list.name}</h3>
                <a class="user-tag" >${usuario.username}</a>
            </div>
            <div class="poster-container">
                ${pelis.join("")}
            </div>
            <p>${list.description}</p>
            <p>❤️${list.usersLikes.length}</p>
            <button onclick="likeLista('${list.id}')">❤️ Me gusta</button>
        `;

        listFragment.appendChild(listCard);
    }

    listaList.innerHTML = ""; // Clear loading text
    listaList.appendChild(listFragment);
}
async function cargarListasPerfil(url) {
    const res = await fetch(`${baseUrl}${url}`);
    if (!res.ok) return;
    const listas = await res.json();

    const listaList = document.getElementById("mis-listas");
    listaList.innerHTML = "Cargando...";
    const listFragment = document.createDocumentFragment();

    for (const list of listas) {
        // Fetch user
        const usuarioRes = await fetch(`${baseUrl}/api/user/${list.ownerId}`);
        if (!usuarioRes.ok) continue;
        const usuario = await usuarioRes.json();

        // Fetch all movies concurrently
        const pelis = await Promise.all(list.movies.map(async (movieId) => {
            const movieRes = await fetch(`${baseUrl}/api/movies/${movieId}`);
            if (!movieRes.ok) return '';
            const peli = await movieRes.json();
            return `<img src="https://image.tmdb.org/t/p/w92${peli.poster_path}" alt="${peli.title}" title="${peli.title}">`;
        }));

        // Create list card
        const listCard = document.createElement('li');
        listCard.classList.add('movie-list-card');
        listCard.innerHTML = `
            <div class="list-header" >
                <h3>${list.name}</h3>
                <a class="user-tag" onclick="cargarPerfil('${list.ownerId}')">${usuario.username}</a>
            </div>
            <div class="poster-container">
                ${pelis.join("")}
            </div>
            <p>${list.description}</p>
            <p>❤️${list.usersLikes.length}</p>
            <button onclick="likeLista('${list.id}')">❤️ Me gusta</button>
        `;

        listFragment.appendChild(listCard);
    }

    listaList.innerHTML = ""; // Clear loading text
    listaList.appendChild(listFragment);
}
async function cargarListasPersonales() {
    const res = await fetch(`${baseUrl}/api/movie-lists/me`,
        {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        }
        );
    if (!res.ok) return;
    const listas = await res.json();

    const listaList = document.getElementById("mis-listas");
    listaList.innerHTML = "Cargando...";
    const listFragment = document.createDocumentFragment();

    for (const list of listas) {
        // Fetch user
        const usuarioRes = await fetch(`${baseUrl}/api/user/${list.ownerId}`);
        if (!usuarioRes.ok) continue;
        const usuario = await usuarioRes.json();

        // Fetch all movies concurrently
        const pelis = await Promise.all(list.movies.map(async (movieId) => {
            const movieRes = await fetch(`${baseUrl}/api/movies/${movieId}`);
            if (!movieRes.ok) return '';
            const peli = await movieRes.json();
            return `<img src="https://image.tmdb.org/t/p/w92${peli.poster_path}" alt="${peli.title}" title="${peli.title}">`;
        }));

        // Create list card
        const listCard = document.createElement('li');
        listCard.classList.add('movie-list-card');
        listCard.innerHTML = `
            <div class="list-header" >
                <h3>${list.name}</h3>
                <a class="user-tag" onclick="cargarPerfil('${list.ownerId}')">${usuario.username}</a>
            </div>
            <div class="poster-container">
                ${pelis.join("")}
            </div>
            <p>${list.description}</p>
            <p>❤️${list.usersLikes.length}</p>
            <button onclick="likeLista('${list.id}')">❤️ Me gusta</button>
        `;

        listFragment.appendChild(listCard);
    }

    listaList.innerHTML = ""; // Clear loading text
    listaList.appendChild(listFragment);
}

async function buscarListas(){
    const query = document.getElementById("queryListas").value;
    document.getElementById("listas-titulo").textContent = "Resultados de búsqueda";
    const queryUrl = `/api/movie-lists/search?query=${encodeURIComponent(query)}`;

    const results = document.getElementById("listas");
    results.innerHTML = "";
    await cargarListas(queryUrl);

}
async function likeLista(listaId){

    const res = await fetch(`${baseUrl}/api/movie-lists/favorite/${listaId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    });
    alert(res.ok ? "Le diste like a la lista" : "Error al dar like");
    if (res.ok) ;
}
async function cargarPerfil(userId){
    cargarRatingsPorId(userId);
    cargarFavoritosPorId(userId);
    cargarListasPerfil(`/api/movie-lists/${userId}`);
    const perfilContainer = document.getElementById("perfil-panel");
    perfilContainer.innerHTML = "Cargando perfil...";

    try {
        // Get user data
        const resUser = await fetch(`${baseUrl}/api/user/${userId}`,
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );
        if (!resUser.ok) throw new Error("Error al cargar usuario");
        const usuario = await resUser.json();

        // Get friends
        const resFriends = await fetch(`${baseUrl}/api/user/${userId}/friends`);
        const amigos = resFriends.ok ? await resFriends.json() : [];




        // Build profile HTML
        perfilContainer.innerHTML = `
            <div class="user-profile-card">
                <h2 style="text-align: left">${usuario.username}</h2>
                
                <section>
                    <h3>Amigos</h3>
                    <ul class="friend-list" id="lista-amigos">
                        ${amigos.length > 0 ? amigos.map(a => `<li class="friend-row">
                                                                <a class="user-tag" onclick="cargarPerfil('${a.id}')">${a.username}</a>
                                                                </li>`).join('') : "<li>No tiene amigos aún.</li>"}
                    </ul>
                </section>

               

                
            </div>
        `;




    } catch (err) {
        perfilContainer.innerHTML = `<p>Error al cargar perfil: ${err.message}</p>`;
    }
}
async function cargarPerfilUsuario() {
    cargarRatings();
    cargarFavoritos();
    cargarListasPersonales();
    const perfilContainer = document.getElementById("perfil-panel");
    perfilContainer.innerHTML = "Cargando perfil...";

    try {
        // Get user data
        const resUser = await fetch(`${baseUrl}/api/user/profile`,
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            }
            );
        if (!resUser.ok) throw new Error("Error al cargar usuario");
        const usuario = await resUser.json();

        // Get friends
        const resFriends = await fetch(`${baseUrl}/api/user/friends`,
            {
                headers: { "Authorization": `Bearer ${token}` }
            });
        const amigos = resFriends.ok ? await resFriends.json() : [];

        // Get pending requests
        const resPending = await fetch(`${baseUrl}/api/user/friend-requests`,
            {
                headers: { "Authorization": `Bearer ${token}` }
            }
            );
        const pendientes = resPending.ok ? await resPending.json() : [];

        // Build profile HTML
        perfilContainer.innerHTML = `
            <div class="user-profile-card">
                <h2 style="text-align: left">${usuario.username}</h2>
                <section>
                    <h3>Invitar amigo</h3>
                    <form id="form-agregar-amigo">
                        <input type="text" id="nuevo-amigo" placeholder="Nombre de usuario">
                        <button type="submit">Enviar solicitud</button>
                    </form>
                </section>
                <section>
                    <h3>Amigos</h3>
                    <ul class="friend-list" id="lista-amigos">
                        ${amigos.length > 0 ? amigos.map(a => `<li class="friend-row">
                                                                <a class="user-tag" onclick="cargarPerfil('${a.id}')">${a.username}</a>
                                                                <button onclick="eliminarAmigo('${a.username}')">Eliminar</button></li>`).join('') : "<li>No tiene amigos aún.</li>"}
                    </ul>
                </section>

                <section>
                    <h3>📨 Solicitudes Pendientes</h3>
                    <ul class="friend-list" id="solicitudes-pendientes">
                        ${pendientes.length > 0 ? pendientes.map(p => `<li class="friend-row">
                                                                               
                                                                               <a class="user-tag" onclick="cargarPerfil(a.id)>${p.username}</a>
                                                                                <button onclick="aceptarInvitacion('${p.username}')">Aceptar</button>
                                                                                <button onclick="rechazarInvitacion('${p.username}')">Rechazar</button>
                                                                               </li>`).join('') : "<li>No hay solicitudes pendientes.</li>"}
                    </ul>
                </section>

                
            </div>
        `;

        // Add submit listener to add friend form
        document.getElementById("form-agregar-amigo").addEventListener("submit", async (e) => {
            e.preventDefault();
            const nuevoAmigo = document.getElementById("nuevo-amigo").value;
            if (!nuevoAmigo) return;

            const resAdd = await fetch(`${baseUrl}/api/user/friend-invite/${nuevoAmigo}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }

            });

            if (resAdd.ok) {
                alert("Solicitud enviada");
                document.getElementById("nuevo-amigo").value = "";
                //cargarPerfilUsuario(); // Refresh profile
            } else {
                alert("No se encontro al usuario.");
            }
        });

    } catch (err) {
        perfilContainer.innerHTML = `<p>Error al cargar perfil: ${err.message}</p>`;
    }
}
async function eliminarAmigo(username){

    const res = await fetch(`${baseUrl}/api/user/friends/${username}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    });
    alert(res.ok ? "Amigo eliminado" : "Error al eliminar amigo");
    if (res.ok) await cargarPerfilUsuario();
}

async function aceptarInvitacion(username){
    const res = await fetch(`${baseUrl}/api/user/friend-accept/${username}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    });
    alert(res.ok ? "Solictud aceptada" : "Error aceptar la solicitud");
    if (res.ok) await cargarPerfilUsuario();
}
async function rechazarInvitacion(username){
    const res = await fetch(`${baseUrl}/api/user/friend-reject/${username}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    });
    alert(res.ok ? "Solictud rechazada" : "Error rechazar la solicitud");
    if (res.ok) await cargarPerfilUsuario();
}


function mostrarSeccion(nombre) {
    const popularesPanel = document.getElementById("populares-panel");
    const buscarPanel = document.getElementById("search-panel");
    //const favoritosPanel = document.getElementById("favoritos-panel");
    //const puntuacionesPanel = document.getElementById("puntuaciones-panel");
    const listasPanel = document.getElementById("listas-panel");
    //const perfilPanel = document.getElementById("perfil-panel");
    const contenedorPerfil = document.getElementById("contenedor-perfil");

    // Ocultar todos los paneles
    popularesPanel.style.display = "none";
    buscarPanel.style.display = "none";
    //favoritosPanel.style.display = "none";
    //puntuacionesPanel.style.display = "none";
    listasPanel.style.display = "none";
    //perfilPanel.style.display = "none";
    contenedorPerfil.style.display = "none";

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
        case "listas":
            listasPanel.style.display = "block";
            document.getElementById("queryListas").value = "";
            document.getElementById("listas-titulo").textContent = "Listas populares";
            cargarListas('/api/movie-lists/most-liked');
            break;
        case "perfil":
            contenedorPerfil.style.display = "block";
            cargarPerfilUsuario();
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
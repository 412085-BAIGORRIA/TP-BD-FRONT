const API_KEY = "826664005a5966d64d967b70dcc87724";
const URL_BASE = "https://api.themoviedb.org/3/movie";

function obtenerIdDesdeURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

async function traerDetalle() {
    const id = obtenerIdDesdeURL();
    const contenedor = document.getElementById("detalle");

    if (!id) {
        contenedor.innerHTML = `<p class="text-danger">No se encontró la película.</p>`;
        return;
    }

    try {
        const respuesta = await fetch(`${URL_BASE}/${id}?api_key=${API_KEY}&language=es`);
        const pelicula = await respuesta.json();
        const fecha = pelicula.release_date;
        const fechaFormateada = fecha ? new Date(fecha).toLocaleDateString('es-ES') : 'Fecha no disponible';

        contenedor.innerHTML = `
            <div class="col-md-8">
                <div class="card mb-4 shadow">
                    <img src="https://image.tmdb.org/t/p/w500${pelicula.poster_path}" class="card-img-top" alt="${pelicula.title}">
                    <div class="card-body">
                        <h2 class="card-title">${pelicula.title}</h2>
                        <p class="card-text"><strong>Resumen:</strong> ${pelicula.overview || "Sin descripción disponible."}</p>
                        <p class="card-text"><strong>Fecha de estreno:</strong> ${fechaFormateada}</p>
                        <p class="card-text"><strong>Rating:</strong> ${pelicula.vote_average}/10</p>
                        
                        <div class="user-actions mt-4">
                            <div class="form-check form-switch mb-3">
                                <input class="form-check-input" type="checkbox" id="watched-switch">
                                <label class="form-check-label" for="watched-switch">Marcar como vista</label>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Tu puntuación:</label>
                                <div class="rating-stars">
                                    ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(star => `
                                        <input type="radio" id="star-${star}" name="rating" value="${star}" class="d-none">
                                        <label for="star-${star}" class="star-label">★</label>
                                    `).join('')}
                                </div>
                            </div>
                            
                            <button id="favorite-btn" class="btn btn-outline-secondary mb-3">
                                <i class="bi bi-heart"></i> Favoritos
                            </button>
                            
                            <div class="mb-3">
                                <label for="review-text" class="form-label">Tu reseña:</label>
                                <textarea id="review-text" rows="3" class="form-control"></textarea>
                                <button id="save-review-btn" class="btn btn-primary mt-2">Guardar reseña</button>
                            </div>
                            
                            <a href="../index.html" class="btn btn-secondary">Volver al inicio</a>
                        </div>
                    </div>
                </div>
            </div>
        `;

        inicializarEventos(pelicula.id);
    } catch (error) {
        console.error("Error al obtener detalle:", error);
        contenedor.innerHTML = `<p class="text-danger">Error al cargar la información de la película.</p>`;
    }
}

function inicializarEventos(movieId) {
    // Evento para marcar como vista
    document.getElementById('watched-switch').addEventListener('change', function() {
        const watched = this.checked;
        console.log('Película marcada como vista:', watched);
        // guardar en MongoDB
    });

    // Evento para rating con estrellas
    document.querySelectorAll('.star-label').forEach(star => {
        star.addEventListener('click', function() {
            const rating = this.previousElementSibling.value;
            console.log('Puntuación dada:', rating);
            // guardar en MongoDB
        });
    });

    // Evento para favoritos
    document.getElementById('favorite-btn').addEventListener('click', function() {
        this.classList.toggle('btn-danger');
        this.classList.toggle('btn-outline-secondary');
        const isFavorite = this.classList.contains('btn-danger');
        console.log('Película marcada como favorita:', isFavorite);
        // guardar en MongoDB
    });

    // Evento para guardar reseña
    document.getElementById('save-review-btn').addEventListener('click', function() {
        const reviewText = document.getElementById('review-text').value;
        console.log('Reseña guardada:', reviewText);
        // Aguardar en MongoDB
    });
}

document.addEventListener("DOMContentLoaded", traerDetalle);
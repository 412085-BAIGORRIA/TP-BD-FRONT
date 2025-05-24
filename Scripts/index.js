const API_KEY = "826664005a5966d64d967b70dcc87724";
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
});
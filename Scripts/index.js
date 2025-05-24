function traerPeliculas(){

    const listado = document.getElementById("listado");
    
    for(let i = 0; i < 30; i++){
        const div = document.createElement("div");
        div.classList.add("col");
    
        div.innerHTML = `
             <div class="col">
                    <div class="card h-100 shadow-sm">
                        <img src="https://via.placeholder.com/300x450" class="card-img-top" alt="Título de la película">
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title">Título de la Película</h5>
                            <p class="card-text text-truncate">Descripción breve o sinopsis de la película. Esta se corta si es muy larga.</p>
                            <div class="mt-auto">
                                <p class="text-muted mb-1">⭐ 8.2</p>
                                <a href="#" class="btn btn-primary btn-sm">Ver detalles</a>
                            </div>
                        </div>
                    </div>
                </div>
        `
        listado.appendChild(div);
    }

}

addEventListener('DOMContentLoaded', () => {
    traerPeliculas();
});
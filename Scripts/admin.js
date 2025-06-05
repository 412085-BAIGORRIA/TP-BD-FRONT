// baseUrl = "http://localhost:8080";
const baseUrl = "https://tpbdii-backend.onrender.com";
const token = localStorage.getItem("token");
const headers = { "Authorization": `Bearer ${token}` };

// Función utilitaria para truncar títulos largos
function trimTitles(titles) {
    return titles.map(t => t.length > 20 ? t.slice(0, 20) + "…" : t);
}

async function fetchData(url) {
    const res = await fetch(url, { headers });
    return await res.json();
}

async function cargarCharts() {
    const topRated = await fetchData(`${baseUrl}/api/admin/top-rated`);
    const mostVoted = await fetchData(`${baseUrl}/api/admin/most-voted`);
    const mostDivisive = await fetchData(`${baseUrl}/api/admin/most-divisive`);

    const topRatedTitlesRaw = await Promise.all(
        topRated.map(e =>
            fetch(`${baseUrl}/api/movies/${e.movieId}`)
                .then(r => r.json()).then(d => d.title).catch(() => e.movieId))
    );
    const topRatedTitles = trimTitles(topRatedTitlesRaw);
    const topRatedData = topRated.map(e => e.average);

    const mostVotedTitlesRaw = await Promise.all(
        mostVoted.map(e =>
            fetch(`${baseUrl}/api/movies/${e.movieId}`)
                .then(r => r.json()).then(d => d.title).catch(() => e.movieId))
    );
    const mostVotedTitles = trimTitles(mostVotedTitlesRaw);
    const mostVotedData = mostVoted.map(e => e.count);

    const mostDivisiveTitlesRaw = await Promise.all(
        mostDivisive.map(e =>
            fetch(`${baseUrl}/api/movies/${e.movieId}`)
                .then(r => r.json()).then(d => d.title).catch(() => e.movieId))
    );
    const mostDivisiveTitles = trimTitles(mostDivisiveTitlesRaw);
    const mostDivisiveData = mostDivisive.map(e => e.stdDev);

    new Chart(document.getElementById("topRatedChart"), {
        type: "bar",
        data: {
            labels: topRatedTitles,
            datasets: [{
                label: "Promedio de puntuación",
                data: topRatedData,
                backgroundColor: "#27ae60"
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
                tooltip: { callbacks: { label: ctx => `Promedio: ${ctx.raw}` } }
            },
            scales: {
                x: { ticks: { maxRotation: 0, minRotation: 0 } },
                y: { beginAtZero: true }
            }
        }
    });

    new Chart(document.getElementById("mostVotedChart"), {
        type: "bar",
        data: {
            labels: mostVotedTitles,
            datasets: [{
                label: "Cantidad de votos",
                data: mostVotedData,
                backgroundColor: "#2980b9"
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
                tooltip: { callbacks: { label: ctx => `Votos: ${ctx.raw}` } }
            },
            scales: {
                x: { ticks: { maxRotation: 0, minRotation: 0 } },
                y: { beginAtZero: true }
            }
        }
    });

    new Chart(document.getElementById("mostDivisiveChart"), {
        type: "bar",
        data: {
            labels: mostDivisiveTitles,
            datasets: [{
                label: "Desviación estándar",
                data: mostDivisiveData,
                backgroundColor: "#e67e22"
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: { label: ctx => `STD: ${ctx.raw.toFixed(2)}` }
                }
            },
            scales: {
                x: { ticks: { maxRotation: 0, minRotation: 0 } },
                y: { beginAtZero: true }
            }
        }
    });
}

cargarCharts();

// Nuevo bloque para mostrar gráfico de torta con votos por país
async function cargarGraficoTorta(movieId, titulo = "") {
    const res = await fetch(`${baseUrl}/api/admin/rating-distribution?movieId=${movieId}`, { headers });

    if (res.status === 403) {
        alert("No autorizado. Necesitás permisos de administrador.");
        return;
    }

    const dist = await res.json();
    console.log("Distribución recibida:", dist);

    const labels = Object.keys(dist);
    const data = Object.values(dist);

    if (data.reduce((a, b) => a + b, 0) === 0) {
        alert(`No hay votos registrados para "${titulo || movieId}" en ningún país.`);
        return;
    }

    const ctx = document.getElementById("countryPieChart").getContext("2d");
    if (window.countryPieInstance) window.countryPieInstance.destroy();

    window.countryPieInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                label: `Votos por país - ${titulo || movieId}`,
                data: data,
                backgroundColor: labels.map(() => `hsl(${Math.random() * 360}, 60%, 60%)`),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: ctx => `${ctx.label}: ${ctx.raw} votos`
                    }
                },
                legend: {
                    position: 'right'
                }
            }
        }
    });
}

async function buscarPorTitulo() {
    const title = document.getElementById("movie-title-input").value;
    if (!title) return alert("Ingresá un título");

    const res = await fetch(`${baseUrl}/api/movies/search?query=${encodeURIComponent(title)}`);
    const data = await res.json();

    if (!data.results || data.results.length === 0) {
        alert("Película no encontrada");
        return;
    }

    const movieId = data.results[0].id;
    await cargarGraficoTorta(movieId, data.results[0].title);
}


// Función para consumir el endpoint /top-critics y actualizar tabla y gráfico
async function cargarTopCriticos() {
    const limit = document.getElementById('criticsLimitInput').value || 10;
    const token = localStorage.getItem("token"); // asumo que guardás token JWT en localStorage
    const headers = { "Authorization": `Bearer ${token}` };

    try {
        const res = await fetch(`${baseUrl}/api/admin/top-critics?limit=${limit}`, { headers });

        if (res.status === 403) {
            alert('No autorizado. Necesitás permisos de administrador.');
            return;
        }
        if (!res.ok) throw new Error("Error al obtener datos");

        const data = await res.json();

        // Actualizar tabla
        const tbody = document.getElementById('criticsTableBody');
        tbody.innerHTML = "";
        data.forEach(user => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
          <td>${user.username}</td>
          <td>${user.average.toFixed(2)}</td>
          <td>${user.ratingsCount}</td>
        `;
            tbody.appendChild(tr);
        });

        // Actualizar gráfico
        const ctx = document.getElementById('criticsChart').getContext('2d');
        if (window.criticsChartInstance) window.criticsChartInstance.destroy();

        window.criticsChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(u => u.username),
                datasets: [{
                    label: 'Promedio de puntuación',
                    data: data.map(u => u.average),
                    backgroundColor: '#6f42c1',
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: true, max: 5 }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: ctx => `Promedio: ${ctx.raw.toFixed(2)}`
                        }
                    }
                }
            }
        });

    } catch (error) {
        console.error(error);
        alert('Error al cargar datos de críticos');
    }
}

// Opcional: cargar al iniciar el panel
window.addEventListener('DOMContentLoaded', cargarTopCriticos);



// Cargar ranking para el país seleccionado
async function cargarRankingPorPais(paisCodigo) {
    try {
        if (!paisCodigo) return; // No hacer nada si no hay país

        const res = await fetch(`${baseUrl}/api/admin/country-ranking?country=${paisCodigo}`, { headers });

        if (!res.ok) throw new Error('No autorizado o error al cargar datos');

        const data = await res.json();

        const tbody = document.querySelector('#countryRankingTable tbody');
        tbody.innerHTML = ''; // limpiar tabla

        for (const { country, uniqueMoviesRated, topMovies } of data) {
            const moviesWithTitles = await Promise.all(
                topMovies.map(async (m) => {
                    try {
                        const res = await fetch(`${baseUrl}/api/movies/${m.movieId}`, { headers });
                        if (!res.ok) throw new Error('Error al obtener película');
                        const movieData = await res.json();
                        return {
                            title: movieData.title || m.movieId,
                            votes: m.votes
                        };
                    } catch {
                        return {
                            title: `ID: ${m.movieId}`,
                            votes: m.votes
                        };
                    }
                })
            );

            const topMoviesText = moviesWithTitles
                .map(m => `${m.title} (Votos: ${m.votes})`)
                .join('<br>');

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${country}</td>
                <td>${uniqueMoviesRated}</td>
                <td>${topMoviesText}</td>
            `;
            tbody.appendChild(tr);
        }
    } catch (error) {
        console.error('Error cargando ranking por país:', error);
        alert('Error cargando ranking por país: ' + error.message);
    }
}

// Al cargar la página, cargar países y preparar evento
window.addEventListener('load', async () => {
    await cargarPaises();

    const select = document.getElementById("countrySelect");
    select.addEventListener('change', (e) => {
        const paisCodigo = e.target.value;
        cargarRankingPorPais(paisCodigo);
    });
});



async function cargarPaises() {
    const paises = new Intl.DisplayNames(['es'], { type: 'region' });
    const select = document.getElementById("countrySelect");

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

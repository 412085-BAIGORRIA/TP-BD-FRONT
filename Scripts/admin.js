const baseUrl = "http://localhost:8080";
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
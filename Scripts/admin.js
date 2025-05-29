const baseUrl = "http://localhost:8080";
const token = localStorage.getItem("token");
const headers = { "Authorization": `Bearer ${token}` };

async function fetchData(url) {
    const res = await fetch(url, { headers });
    return await res.json();
}

async function cargarCharts() {
    const topRated = await fetchData(`${baseUrl}/api/admin/top-rated`);
    const mostVoted = await fetchData(`${baseUrl}/api/admin/most-voted`);
    const mostDivisive = await fetchData(`${baseUrl}/api/admin/most-divisive`);

    const topRatedTitles = await Promise.all(
        topRated.map(e => fetch(`${baseUrl}/api/movies/${e.movieId}`)
            .then(r => r.json()).then(d => d.title).catch(() => e.movieId))
    );
    const topRatedData = topRated.map(e => e.average);

    const mostVotedTitles = await Promise.all(
        mostVoted.map(e => fetch(`${baseUrl}/api/movies/${e.movieId}`)
            .then(r => r.json()).then(d => d.title).catch(() => e.movieId))
    );
    const mostVotedData = mostVoted.map(e => e.count);

    const mostDivisiveTitles = await Promise.all(
        mostDivisive.map(e => fetch(`${baseUrl}/api/movies/${e.movieId}`)
            .then(r => r.json()).then(d => d.title).catch(() => e.movieId))
    );
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
                tooltip: { callbacks: { label: ctx => `STD: ${ctx.raw.toFixed(2)}` } }
            }
        }
    });
}

cargarCharts();
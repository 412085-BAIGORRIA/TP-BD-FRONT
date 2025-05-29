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
        topRated.map(e => fetch(`${baseUrl}/api/movies/${e.movieId}`)
            .then(r => r.json()).then(d => d.title).catch(() => e.movieId))
    );
    const topRatedTitles = trimTitles(topRatedTitlesRaw);
    const topRatedData = topRated.map(e => e.average);

    const mostVotedTitlesRaw = await Promise.all(
        mostVoted.map(e => fetch(`${baseUrl}/api/movies/${e.movieId}`)
            .then(r => r.json()).then(d => d.title).catch(() => e.movieId))
    );
    const mostVotedTitles = trimTitles(mostVotedTitlesRaw);
    const mostVotedData = mostVoted.map(e => e.count);

    const mostDivisiveTitlesRaw = await Promise.all(
        mostDivisive.map(e => fetch(`${baseUrl}/api/movies/${e.movieId}`)
            .then(r => r.json()).then(d => d.title).catch(() => e.movieId))
    );
    const mostDivisiveTitles = trimTitles(mostDivisiveTitlesRaw);
    const mostDivisiveData = mostDivisive.map(e => e.stdDev);

    // Chart 1 - Top Rated
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
                x: {
                    ticks: {
                        maxRotation: 0,
                        minRotation: 0
                    }
                },
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Chart 2 - Most Voted
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
                tooltip: {
                    callbacks: {
                        label: ctx => `Votos: ${ctx.raw}`
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        maxRotation: 0,
                        minRotation: 0
                    }
                },
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Chart 3 - Most Divisive
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
                    callbacks: {
                        label: ctx => `STD: ${ctx.raw.toFixed(2)}`
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        maxRotation: 0,
                        minRotation: 0
                    }
                },
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

cargarCharts();

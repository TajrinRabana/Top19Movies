// Function to format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
    }).format(amount);
}

// Function to format date
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Function to create movie card
function createMovieCard(movie) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    
    // Format the base64 image data with the correct prefix
    const posterSrc = movie.poster.startsWith('data:image') 
        ? movie.poster 
        : `data:image/jpeg;base64,${movie.poster}`;
    
    card.innerHTML = `
        <img src="${posterSrc}" alt="${movie.name}" class="movie-poster">
        <div class="movie-info">
            <h3 class="movie-title">${movie.name}</h3>
            <div class="movie-details">
                <p>Year: ${movie.year}</p>
                <p>Distributor: ${movie.distributor}</p>
                <p>Release Date: ${formatDate(movie.releaseDate)}</p>
                <p>Box Office: ${formatCurrency(movie.boxOffice)}</p>
            </div>
        </div>
    `;

    // Add click event to show trailer
    card.addEventListener('click', () => showTrailer(movie));
    
    return card;
}

// Function to show trailer modal
function showTrailer(movie) {
    // Create modal container
    const modal = document.createElement('div');
    modal.className = 'modal';
    
    // Create modal content

    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-button">&times;</span>
            <h2>${movie.name} (${movie.year})</h2>
            <div class="video-container">
            ${movie.trailer}
            </div>
            <div class="movie-details-modal">
                <p><strong>Distributor:</strong> ${movie.distributor}</p>
                <p><strong>Release Date:</strong> ${formatDate(movie.releaseDate)}</p>
                <p><strong>Box Office:</strong> ${formatCurrency(movie.boxOffice)}</p>
            </div>
        </div>
    `;
    
    // Add modal to body
    document.body.appendChild(modal);
    
    // Add close functionality
    const closeButton = modal.querySelector('.close-button');
    closeButton.onclick = () => {
        modal.remove();
    };
    
    // Close modal when clicking outside
    modal.onclick = (event) => {
        if (event.target === modal) {
            modal.remove();
        }
    };
}

// Function to parse CSV row
function parseCSVRow(row) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < row.length; i++) {
        const char = row[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current);
    return result;
}

// Function to create distributor pie chart
function createDistributorChart(movies) {
    const distributorData = {};
    movies.forEach(movie => {
        distributorData[movie.distributor] = (distributorData[movie.distributor] || 0) + 1;
    });

    const ctx = document.getElementById('distributorChart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(distributorData),
            datasets: [{
                data: Object.values(distributorData),
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF',
                    '#FF9F40',
                    '#8AC249',
                    '#EA526F',
                    '#23B5D3',
                    '#279AF1'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right',
                },
                title: {
                    display: true,
                    text: 'Movies by Distributor'
                }
            }
        }
    });
}

// Function to create box office trend chart
function createBoxOfficeChart(movies) {
    // Sort movies by year
    const sortedMovies = [...movies].sort((a, b) => a.year - b.year);
    
    const ctx = document.getElementById('boxOfficeChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: sortedMovies.map(movie => movie.year),
            datasets: [{
                label: 'Box Office Total (USD)',
                data: sortedMovies.map(movie => movie.boxOffice),
                borderColor: '#36A2EB',
                backgroundColor: 'rgba(54, 162, 235, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Box Office Trends Over Years'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

// Function to update statistics
function updateStatistics(movies) {
    document.getElementById('totalMovies').textContent = movies.length;
    
    const highestGrossing = Math.max(...movies.map(movie => movie.boxOffice));
    document.getElementById('highestGrossing').textContent = formatCurrency(highestGrossing);
    
    const latestRelease = movies.reduce((latest, movie) => {
        return new Date(movie.releaseDate) > new Date(latest.releaseDate) ? movie : latest;
    });
    document.getElementById('latestRelease').textContent = latestRelease.name;
    
    const uniqueStudios = new Set(movies.map(movie => movie.distributor));
    document.getElementById('totalStudios').textContent = uniqueStudios.size;
}

// Function to set featured movie
function setFeaturedMovie(movies) {
    const featuredMovie = movies[Math.floor(Math.random() * movies.length)];
    const featuredSection = document.querySelector('.featured-movie');
    
    featuredSection.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${featuredMovie.poster})`;
    document.getElementById('featuredTitle').textContent = featuredMovie.name;
    document.getElementById('featuredDescription').textContent = 
        `${featuredMovie.year} • ${featuredMovie.distributor} • Box Office: ${formatCurrency(featuredMovie.boxOffice)}`;
    
    document.getElementById('featuredTrailerBtn').onclick = () => showTrailer(featuredMovie);
}

// Function to populate filters
function populateFilters(movies) {
    const yearFilter = document.getElementById('yearFilter');
    const distributorFilter = document.getElementById('distributorFilter');
    
    // Get unique years and distributors
    const years = [...new Set(movies.map(movie => movie.year))].sort();
    const distributors = [...new Set(movies.map(movie => movie.distributor))].sort();
    
    // Populate year filter
    years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearFilter.appendChild(option);
    });
    
    // Populate distributor filter
    distributors.forEach(distributor => {
        const option = document.createElement('option');
        option.value = distributor;
        option.textContent = distributor;
        distributorFilter.appendChild(option);
    });
}

// Function to filter and sort movies
function filterAndSortMovies(movies) {
    const yearFilter = document.getElementById('yearFilter').value;
    const distributorFilter = document.getElementById('distributorFilter').value;
    const sortBy = document.getElementById('sortBy').value;
    
    let filteredMovies = [...movies];
    
    // Apply filters
    if (yearFilter) {
        filteredMovies = filteredMovies.filter(movie => movie.year === yearFilter);
    }
    if (distributorFilter) {
        filteredMovies = filteredMovies.filter(movie => movie.distributor === distributorFilter);
    }
    
    // Apply sorting
    filteredMovies.sort((a, b) => {
        switch (sortBy) {
            case 'year':
                return a.year - b.year;
            case 'boxOffice':
                return b.boxOffice - a.boxOffice;
            case 'name':
                return a.name.localeCompare(b.name);
            default:
                return 0;
        }
    });
    
    return filteredMovies;
}

// Function to update movie grid
function updateMovieGrid(movies) {
    const moviesGrid = document.getElementById('moviesGrid');
    moviesGrid.innerHTML = '';
    
    movies.forEach(movie => {
        const card = createMovieCard(movie);
        moviesGrid.appendChild(card);
    });
}

// Add event listeners for filters
document.getElementById('yearFilter').addEventListener('change', () => {
    const filteredMovies = filterAndSortMovies(window.allMovies);
    updateMovieGrid(filteredMovies);
});

document.getElementById('distributorFilter').addEventListener('change', () => {
    const filteredMovies = filterAndSortMovies(window.allMovies);
    updateMovieGrid(filteredMovies);
});

document.getElementById('sortBy').addEventListener('change', () => {
    const filteredMovies = filterAndSortMovies(window.allMovies);
    updateMovieGrid(filteredMovies);
});

// Function to load and display movies
async function loadMovies() {
    try {
        const response = await fetch('popularmovie.csv');
        const data = await response.text();
        
        // Parse CSV data
        const rows = data.split('\n').slice(1); // Skip header row
        const movies = [];
        
        rows.forEach(row => {
            if (!row.trim()) return; // Skip empty rows
            
            const [year, name, distributor, releaseDate, boxOffice, poster, trailer] = parseCSVRow(row);
            
            if (name) {
                const movie = {
                    year,
                    name,
                    distributor,
                    releaseDate,
                    boxOffice: parseFloat(boxOffice.replace(/[^0-9.-]+/g, '')),
                    poster: poster.replace(/^"|"$/g, ''),
                    trailer: trailer.replace(/^"|"$/g, '')
                };
                
                movies.push(movie);
            }
        });

        // Store all movies globally for filtering
        window.allMovies = movies;
        
        // Update UI
        updateStatistics(movies);
        setFeaturedMovie(movies);
        populateFilters(movies);
        updateMovieGrid(movies);
        
        // Create charts
        createDistributorChart(movies);
        createBoxOfficeChart(movies);
    } catch (error) {
        console.error('Error loading movies:', error);
    }
}

// Load movies when page loads
document.addEventListener('DOMContentLoaded', loadMovies);

// Add search functionality
const searchInput = document.querySelector('.search input');
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const cards = document.querySelectorAll('.movie-card');
    
    cards.forEach(card => {
        const title = card.querySelector('.movie-title').textContent.toLowerCase();
        card.style.display = title.includes(searchTerm) ? 'block' : 'none';
    });
}); 
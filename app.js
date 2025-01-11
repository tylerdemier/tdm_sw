const loginButton = document.getElementById('login-btn');

loginButton.addEventListener('click', () => {
    // Redirige al usuario para autenticarse con Spotify
    window.location.href = 'http://localhost:8888/login';
});

// Después de autenticarse, manejar los tokens (usa localStorage para guardar)
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

if (urlParams.has('access_token')) {
    const accessToken = urlParams.get('access_token');
    console.log('Access Token:', accessToken);
    localStorage.setItem('access_token', accessToken);
}

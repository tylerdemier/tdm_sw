/**
 * Dependencias instaladas:
 *  - express: Para crear el servidor web.
 *  - request: Para manejar las peticiones HTTP.
 *  - dotenv: Para manejar variables de entorno.
 *  - cors: Para permitir peticiones desde el frontend.
 */
const express = require('express');
const request = require('request');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();
const app = express();
const port = process.env.PORT || 8888;

/**
 * Variables del entorno
 */
const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const redirect_uri = process.env.REDIRECT_URI;

/**
 * Middleware
 */
app.use(cors());
app.use(express.json());

/**
 * Ruta para autenticar y obtener tokens
 */
app.get('/login', (req, res) => {
    const scopes = 'user-read-recently-played user-read-playback-state';
    const auth_url = `https://accounts.spotify.com/authorize?response_type=code&client_id=${client_id}&scope=${encodeURIComponent(
        scopes
    )}&redirect_uri=${encodeURIComponent(redirect_uri)}`;

    res.redirect(auth_url);
});

/**
 * Callback para obtener access_token y refresh_token
 */
app.get('/callback', (req, res) => {
    const code = req.query.code || null;

    const authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
            code: code,
            redirect_uri: redirect_uri,
            grant_type: 'authorization_code',
        },
        headers: {
            Authorization:
                'Basic ' +
                Buffer.from(`${client_id}:${client_secret}`).toString('base64'),
        },
        json: true,
    };

    request.post(authOptions, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            const { access_token, refresh_token } = body;

            res.json({
                access_token: access_token,
                refresh_token: refresh_token,
            });
        } else {
            res.status(response.statusCode).send('Error al autenticar');
        }
    });
});

/**
 * Ruta para refrescar el token
 */
app.get('/refresh_token', (req, res) => {
    const refresh_token = req.query.refresh_token;

    const authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        headers: {
            Authorization:
                'Basic ' +
                Buffer.from(`${client_id}:${client_secret}`).toString('base64'),
        },
        form: {
            grant_type: 'refresh_token',
            refresh_token: refresh_token,
        },
        json: true,
    };

    request.post(authOptions, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            const { access_token } = body;
            res.json({
                access_token: access_token,
            });
        } else {
            res.status(response.statusCode).send('Error al refrescar token');
        }
    });
});

/**
 * Inicia el servidor
 */
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
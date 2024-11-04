// firebaseMessagingService.js
import { GoogleAuth } from 'google-auth-library';
import axios from 'axios';

async function getAccessToken() {
    try {
        const auth = new GoogleAuth({
            credentials: {
                client_email: process.env.FIREBASE_CLIENT_EMAIL,
                private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Reemplaza '\\n' por '\n'
            },
            scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
        });

        const accessToken = await auth.getAccessToken();

        if (!accessToken) {
            console.log("No se pudo obtener el token de acceso.");
            throw new Error("Error al obtener el token de acceso de Google Auth.");
        }

        // console.log('Access Token obtenido:', accessToken);
        return accessToken;
    } catch (error) {
        console.error("Error al obtener el token de acceso:", error);
        throw new Error("No se pudo obtener el token de acceso.");
    }
}

export async function sendNotification(tokens, payload) {
    try {
        const accessToken = await getAccessToken();
        const projectId = process.env.FIREBASE_PROJECT_ID;
        const url = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;

        if (!Array.isArray(tokens)) {
            tokens = [tokens]; // Si tokens no es un arreglo, conviértelo en uno
        }

        const results = [];

        for (const token of tokens) {
            const requestPayload = {
                message: {
                    token: token,
                    ...payload,
                },
            };

            try {
                const response = await axios.post(url, requestPayload, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                });
                results.push({ success: true, token, response: response.data });
            } catch (error) {
                console.error(`Error enviando notificación a FCM para token ${token}:`, error.response ? error.response.data : error.message);
                results.push({ success: false, token, error: error.response ? error.response.data : error.message });
            }
        }

        return results;
    } catch (error) {
        console.error('Error general enviando notificación:', error.message);
        throw new Error('Error general al enviar las notificaciones');
    }
}


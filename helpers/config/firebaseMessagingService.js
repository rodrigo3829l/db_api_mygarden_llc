// firebaseMessagingService.js
import { GoogleAuth } from 'google-auth-library';
import axios from 'axios';
import serviceAccount from './notifications-32633-firebase-adminsdk-nzm2m-982158c5ff.json' assert { type: 'json' };

async function getAccessToken() {
    const auth = new GoogleAuth({
        credentials: {
            client_email: serviceAccount.client_email,
            private_key: serviceAccount.private_key,
        },
        scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
    });
    const accessToken = await auth.getAccessToken();
    // console.log('Access Token:', accessToken);
    return accessToken;
}

export async function sendNotification(tokens, payload) {
    try {
        const accessToken = await getAccessToken();
        const projectId = serviceAccount.project_id;
        const url = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;

        for (const token of tokens) {
            // Crear el payload JSON para la solicitud
            const requestPayload = {
                message: {
                    token: token, // Ahora token es una cadena individual
                    ...payload,
                },
            };

            // Imprimir el JSON antes de enviarlo
            // console.log('Payload JSON que se enviará a FCM:', JSON.stringify(requestPayload, null, 2));

            // Hacer la solicitud HTTP
            const response = await axios.post(url, requestPayload, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });

            // console.log('Respuesta de Firebase:', response.data);
        }

        return { success: true, message: 'Notificaciones enviadas a todos los tokens' };
    } catch (error) {
        console.error('Error enviando notificación a FCM:', error.response ? error.response.data : error.message);
        throw new Error('Error al enviar la notificación');
    }
}

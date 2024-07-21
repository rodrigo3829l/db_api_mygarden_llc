import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../app.js'; // Importa tu aplicación de Express

describe('Book Service Endpoint', () => {
    let idUsers = [];
    let idServices = [];
    const startDate = new Date('2024-07-27');
    let currentDate = new Date(startDate);

    // Función para generar descripciones aleatorias
    const generateRandomDescription = () => {
        const descriptions = [
            "Servicio de mantenimiento general",
            "Diseño de jardín personalizado",
            "Construcción de áreas verdes",
            "Mantenimiento de césped y podado",
            "Instalación de sistemas de riego",
            "Decoración de jardín con plantas exóticas"
        ];
        return descriptions[Math.floor(Math.random() * descriptions.length)];
    };

    beforeAll(async () => {
        // Obtener usuarios
        const usersRes = await request(app).get('/api/user/get');
        idUsers = usersRes.body.users.map(user => user._id);

        // Obtener servicios
        const servicesRes = await request(app).get('/api/services/get');
        idServices = servicesRes.body.services.map(service => service._id);
    });

    it('should book multiple services for each user', async () => {
        const totalServicesToBook = 10;

        for (const idUser of idUsers) {
            for (let i = 0; i < totalServicesToBook; i++) {
                const randomServiceId = idServices[Math.floor(Math.random() * idServices.length)];
                const randomDescription = generateRandomDescription();

                const requestBody = {
                    user: idUser,
                    service: randomServiceId,
                    description: randomDescription,
                    img: {
                        public_id: 'aksdbaskdjas',
                        secure_url: 'https://res.cloudinary.com/dui4i9f4e/image/upload/v1697990498/logos/p3xyl9xetmmg6vlamwkt.jpg'
                    },
                    typeReserve: 'online',
                    scheduledTime: new Date(currentDate)
                };
                
                const res = await request(app)
                    .post('/api/schedule/schedule')
                    .send(requestBody);
                console.log(new Date (currentDate))
                console.log(res.body)
                expect(res.body).toHaveProperty('success', true);

                // Incrementar la fecha para la siguiente reserva
                currentDate.setDate(currentDate.getDate() + 1);
            }
        }
    }, 7200000 );

    afterAll(async () => {
        // Cierra la conexión de mongoose después de que terminen todas las pruebas
        await mongoose.connection.close();
    });
});

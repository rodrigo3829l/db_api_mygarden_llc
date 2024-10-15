import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../app.js';

describe('Add Answer Endpoint', () => {
    let authToken;

    // Iniciar sesión para obtener el token
    beforeAll(async () => {
        const res = await request(app)
            .post('/api/user/login')
            .send({
                email: '20210658@gmail.com',
                password: 'Drop345terra#',
                department: 'admin' // Ajusta el departamento/rol según sea necesario
            });
        authToken = res.body.token;
    });

    // Prueba para agregar una respuesta con token y rol válidos
    it('should add answer successfully with valid token and role', async () => {
        const res = await request(app)
            .post('/api/answer/add')
            .set('Authorization', `Bearer ${authToken}`)
            .set('rol', 'admin') // Ajusta el departamento/rol según sea necesario
            .send({
                pregunta: '¿Cuál es la capital de Francia?',
                respuesta: 'La capital de Francia es París.'
            });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('success', true);
        expect(res.body).toHaveProperty('msg', 'Pregunta añadida con exito');
    });

    // Prueba para agregar una respuesta sin token
    it('should return 401 without token', async () => {
        const res = await request(app)
            .post('/api/answer/add')
            .send({
                pregunta: '¿Cuál es la capital de Francia?',
                respuesta: 'La capital de Francia es París.'
            });
        expect(res.statusCode).toEqual(401);
    });

    // Prueba para agregar una respuesta con token inválido
    it('should return 401 with invalid token', async () => {
        const res = await request(app)
            .post('/api/answer/add')
            .set('Authorization', 'Bearer invalidtoken')
            .send({
                pregunta: '¿Cuál es la capital de Francia?',
                respuesta: 'La capital de Francia es París.'
            });
        expect(res.statusCode).toEqual(401);
    });

    // Prueba para agregar una respuesta con rol incorrecto
    it('should return 403 with incorrect role', async () => {
        const res = await request(app)
            .post('/api/answer/add')
            .set('Authorization', `Bearer ${authToken}`)
            .set('rol', 'user') // Rol incorrecto
            .send({
                pregunta: '¿Cuál es la capital de Francia?',
                respuesta: 'La capital de Francia es París.'
            });
        expect(res.statusCode).toEqual(403);
    });
    
    afterAll(async () => {
        await mongoose.connection.close();
    });
});

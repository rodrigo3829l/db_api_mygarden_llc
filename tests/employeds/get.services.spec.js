import request from 'supertest';
import app from '../../app.js';
import mongoose from 'mongoose';

describe('Get Services by employed Endpoint', () => {
    let authToken;

    // Iniciar sesión para obtener el token
    beforeAll(async () => {
        const res = await request(app)
            .post('/api/user/login')
            .send({
                email: 'empleado@gmail.com',
                password: 'Hola123#',
                department: 'employed' 
            });
        authToken = res.body.token;
    });

    // Prueba para obtener los servicios del empleado con token y rol válidos
    it('should get services by employed successfully with valid token and role', async () => {
        const res = await request(app)
            .get('/api/employed/services')
            .set('Authorization', `Bearer ${authToken}`)
            .set('rol', 'employed'); 
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('success', true);
        expect(res.body).toHaveProperty('services');
        const services = res.body.services;
        expect(services.length).toBeGreaterThan(0);
    });

    // Prueba para obtener los servicios del empleado sin token
    it('should return 401 without token', async () => {
        const res = await request(app)
            .get('/api/employed/services');
        expect(res.statusCode).toEqual(401);
    });

    // Prueba para obtener los servicios del empleado con token inválido
    it('should return 401 with invalid token', async () => {
        const res = await request(app)
            .get('/api/employed/services')
            .set('Authorization', 'Bearer invalidtoken');
        expect(res.statusCode).toEqual(401);
    });

    // Prueba para obtener los servicios del empleado con rol incorrecto
    it('should return 403 with incorrect role', async () => {
        const res = await request(app)
            .get('/api/employed/services')
            .set('Authorization', `Bearer ${authToken}`)
            .set('rol', 'admin'); // Rol incorrecto
        expect(res.statusCode).toEqual(403);
    });
    afterAll(async () => {
        await mongoose.connection.close();
    });
});

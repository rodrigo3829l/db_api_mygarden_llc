import request from 'supertest';
import app from '../../app.js';
import mongoose from 'mongoose';

describe('Get Pays Endpoint', () => {
    let authToken;

    beforeAll(async () => {
        const res = await request(app)
            .post('/api/user/login')
            .send({
                email: 'finprueba@gmail.com',
                password: 'Hola123#',
                department: 'finance'
            });
        authToken = res.body.token;
    });

    // Prueba para obtener los pagos con token y rol válidos
    it('should get pays successfully with valid token and role', async () => {
        const res = await request(app)
            .get('/api/pays/get')
            .set('Authorization', `Bearer ${authToken}`)
            .set('rol', 'finance');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('success', true);
        expect(res.body).toHaveProperty('pays');
        const pays = res.body.pays;
        expect(pays.length).toBeGreaterThan(0);
    });

    // Prueba para obtener los pagos sin token
    it('should return 401 without token', async () => {
        const res = await request(app)
            .get('/api/pays/get');
        expect(res.statusCode).toEqual(401);
    });

    // Prueba para obtener los pagos con token inválido
    it('should return 401 with invalid token', async () => {
        const res = await request(app)
            .get('/api/pays/get')
            .set('Authorization', 'Bearer invalidtoken');
        expect(res.statusCode).toEqual(401);
    });

    // Prueba para obtener los pagos con rol incorrecto
    it('should return 403 with incorrect role', async () => {
        const res = await request(app)
            .get('/api/pays/get')
            .set('Authorization', `Bearer ${authToken}`)
            .set('rol', 'employee'); // Rol incorrecto
        expect(res.statusCode).toEqual(403);
    });
    afterAll(async () => {
        await mongoose.connection.close();
    });
});

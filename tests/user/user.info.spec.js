import request from 'supertest';
import app from '../../app.js';
import mongoose from 'mongoose';

describe('Protected Endpoint', () => {
    let authToken;
    let rol = 'admin';
    // Iniciar sesión para obtener el token
    beforeAll(async () => {
        const res = await request(app)
            .post('/api/user/login')
            .send({
                email: '20210658@gmail.com',
                password: 'Drop345terra#',
                department: rol
            });
        authToken = res.body.token;
    });

    // Prueba para acceder a la ruta protegida con token válido y rol adecuado
    it('should access protected route with valid token and role', async () => {
        const res = await request(app)
            .get('/api/user/protected')
            .set('Authorization', `Bearer ${authToken}`)
            .set('rol', rol); 
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('_id');
        expect(res.body).toHaveProperty('fullName');
        expect(res.body).toHaveProperty('name');
        expect(res.body).toHaveProperty('apellidoP');
        expect(res.body).toHaveProperty('apellidoM');
        expect(res.body).toHaveProperty('email');
        expect(res.body).toHaveProperty('phone');
        expect(res.body).toHaveProperty('username');
        expect(res.body).toHaveProperty('fechaNacimiento');
        expect(res.body).toHaveProperty('genero');
        expect(res.body).toHaveProperty('cellPhone');
    });

    // Prueba para acceder a la ruta protegida sin token
    it('should return 401 without token', async () => {
        const res = await request(app)
            .get('/api/user/protected');
        expect(res.statusCode).toEqual(401);
    });

    // Prueba para acceder a la ruta protegida con token inválido
    it('should return 401 with invalid token', async () => {
        const res = await request(app)
            .get('/api/user/protected')
            .set('Authorization', 'Bearer invalidtoken');
        expect(res.statusCode).toEqual(401);
    });

    // Prueba para acceder a la ruta protegida con rol incorrecto
    it('should return 403 with incorrect role', async () => {
        const res = await request(app)
            .get('/api/user/protected')
            .set('Authorization', `Bearer ${authToken}`)
            .set('rol', 'invalidrole'); // Rol incorrecto
        expect(res.statusCode).toEqual(403);
    });
    afterAll(async () => {
        await mongoose.connection.close();
    });
});

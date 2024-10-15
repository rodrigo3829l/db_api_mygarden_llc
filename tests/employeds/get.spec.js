import request from 'supertest';
import app from '../../app.js';
import mongoose from 'mongoose';

describe('Get Employeds Endpoint', () => {
  let authToken;

  // Iniciar sesión para obtener el token
  beforeAll(async () => {
    const res = await request(app)
      .post('/api/user/login')
      .send({
        email: '20210658@gmail.com',
        password: 'Drop345terra#',
        department: 'admin' 
      });
    authToken = res.body.token;
  });

  // Prueba para obtener los empleados con token y rol válidos
  it('should get employeds successfully with valid token and role', async () => {
    const res = await request(app)
      .get('/api/employed/get')
      .set('Authorization', `Bearer ${authToken}`)
      .set('rol', 'admin'); 
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('employeds');
    // Verifica si se devuelven los empleados como se espera
    const employeds = res.body.employeds;
    expect(employeds.length).toBeGreaterThan(0);
  });

  // Prueba para obtener los empleados sin token
  it('should return 401 without token', async () => {
    const res = await request(app)
      .get('/api/employed/get');
    expect(res.statusCode).toEqual(401);
  });

  // Prueba para obtener los empleados con token inválido
  it('should return 401 with invalid token', async () => {
    const res = await request(app)
      .get('/api/employed/get')
      .set('Authorization', 'Bearer invalidtoken');
    expect(res.statusCode).toEqual(401);
  });

  // Prueba para obtener los empleados con rol incorrecto
  it('should return 403 with incorrect role', async () => {
    const res = await request(app)
      .get('/api/employed/get')
      .set('Authorization', `Bearer ${authToken}`)
      .set('rol', 'user'); // Rol incorrecto
    expect(res.statusCode).toEqual(403);
  });
  afterAll(async () => {
    await mongoose.connection.close();
});
});

import request from 'supertest';
import app from '../../app.js';
import mongoose from 'mongoose';

describe('Get Answers Endpoint', () => {
  // Prueba para obtener respuestas
  it('should get answers successfully', async () => {
    const res = await request(app)
      .get('/api/answer/get');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('asnwers');
  });
  afterAll(async () => {
    await mongoose.connection.close();
});
});

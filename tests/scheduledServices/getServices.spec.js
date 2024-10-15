import request from 'supertest';
import app from '../../app.js';
import mongoose from 'mongoose';
describe('Get Schedule Services Endpoint', () => {
    it('should get schedule services successfully', async () => {
        const res = await request(app)
            .get('/api/schedule/getServices');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('success', true);
        expect(res.body).toHaveProperty('services');
        const services = res.body.services;
        expect(services.length).toBeGreaterThan(0);
    });
    afterAll(async () => {
        await mongoose.connection.close();
    });
});

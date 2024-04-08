import request from "supertest";
import app from "../../app.js";
import mongoose from 'mongoose';

describe("Login Endpoint", () => {
    // Prueba para un inicio de sesión exitoso
    it("should login user with correct credentials", async () => {
        const res = await request(app).post("/api/user/login").send({
            email: "20210658@gmail.com",
            password: "Drop345terra#",
            department: "admin",
        });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("token");
        expect(res.body).toHaveProperty("expiresIn");
        expect(res.body).toHaveProperty("name");
        expect(res.body).toHaveProperty("email");
        expect(res.body).toHaveProperty("rol");
    });

    // Prueba para un inicio de sesión con correo electrónico incorrecto
    it("should return 403 if email is invalid", async () => {
        const res = await request(app).post("/api/user/login").send({
            email: "invalid@example.com",
            password: "Drop345terra#",
            department: "admin",
        });
        expect(res.statusCode).toEqual(403);
        expect(res.body).toHaveProperty("error");
    });

    // Prueba para un inicio de sesión con contraseña incorrecta
    it("should return 403 if password is invalid", async () => {
        const res = await request(app).post("/api/user/login").send({
            email: "20210658@gmail.com",
            password: "invalidpassword",
            department: "admin",
        });
        expect(res.statusCode).toEqual(403);
        expect(res.body).toHaveProperty("error");
    });
    afterAll(async () => {
        await mongoose.connection.close();
    });
});

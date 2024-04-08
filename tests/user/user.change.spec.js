import request from "supertest";
import app from "../../app.js";
import mongoose from 'mongoose';

describe("Password Recovery and Change Endpoint", () => {
    let recoveryToken;
    let verificationToken;
    let codeChange;
    // Prueba para recuperar contraseña
    it("should recover password and send verification email", async () => {
        const res = await request(app).post("/api/user/recover").send({
            email: "20210658@gmail.com",
        });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("success", true);
        expect(res.body).toHaveProperty("token");
        expect(res.body).toHaveProperty("code");
        recoveryToken = res.body.token;
        codeChange = res.body.code;
    });

    // Prueba para verificar el código
    it("should verify code successfully", async () => {
        const res = await request(app).post("/api/user/verify").send({
            token: recoveryToken,
            code: codeChange, // Código de verificación, asegúrate de ajustarlo
        });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("success", true);
        verificationToken = recoveryToken; // Utilizar el mismo token para cambiar la contraseña
    });

    // Prueba para cambiar la contraseña
    it("should change password successfully", async () => {
        const res = await request(app).post("/api/user/change").send({
            token: verificationToken,
            password: "Drop345terra#", // Nueva contraseña, ajustar según sea necesario
        });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("success", true);
        expect(res.body).toHaveProperty("msg", "Contraseña cambiada con exito");
    });
    afterAll(async () => {
        await mongoose.connection.close();
    });
});

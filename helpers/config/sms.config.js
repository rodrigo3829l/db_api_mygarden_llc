import axios from "axios";

export const sendSms = async (code, lade, to) => {
    try {
        const baseUrl = 'https://envia-sms.com/api/sms/send?';
        const {data} = await axios.get(`${baseUrl}plantilla=${process.env.PLANTILLA}&token=${process.env.SMS_TOKEN}&numero=${lade},${to}&var_codigo_verificacion=${code}`);
        return data;
    } catch (error) {
        console.log("Algo salió mal al enviar mensaje", error);
    }
};

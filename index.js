import 'dotenv/config';
import express  from "express";
import "./helpers/DataBase/conectdb.js";


console.log("Hola bd => ", process.env.URI_MONGO);

const app = express();

app.use(express.json())
app.use(express.urlencoded(
    {extended: false}
))



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('Run in port http://localhost:' + PORT));

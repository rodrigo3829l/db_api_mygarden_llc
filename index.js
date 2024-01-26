import 'dotenv/config';
import express  from "express";
import "./helpers/DataBase/conectdb.js";
import userRoutes from './routes/user.route.js';
import cors from 'cors'
import cookieParser from 'cookie-parser';


const app = express();
console.log("Hola bd => ", process.env.URI_MONGO);

const whiteList = [process.env.ORIGIN1, process.env.ORIGIN2 , process.env.ORIGIN3, process.env.ORIGIN4, process.env.ORIGIN5, process.env.ORIGIN6 ]

app.use(
    cors({
        origin: function (origin, callback){
            //console.log("HOla origin => ", origin)
            if(!origin || whiteList.includes(origin)){
                return callback(null, origin);
            }
            return callback("Error de corse origin: " + origin + " no autorizado")
        },
        credentials: true,
    })
)

// app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded(
    {extended: false}
))
app.use('/api/user', userRoutes);
app.use(cookieParser());


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('Run in port http://localhost:' + PORT));

import 'dotenv/config';
import express  from "express";
import "./helpers/DataBase/conectdb.js";
import userRoutes from './routes/user.route.js';
import cors from 'cors'
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';

import helmet from 'helmet';


const app = express();
console.log("Hola bd => ", process.env.URI_MONGO);

const whiteList = [process.env.ORIGIN1, process.env.ORIGIN2 , process.env.ORIGIN3]

app.use(
    cors({
        origin: function (origin, callback){
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

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use(helmet());

// Configuración personalizada de Helmet
// app.use(
//     helmet({
//       contentSecurityPolicy: {
//         directives: {
//           defaultSrc: ["'self'"], // Solo permite scripts del mismo origen
//           scriptSrc: ["'self'", "https://trusted-source.com"], // Orígenes de scripts confiables
//           objectSrc: ["'none'"], // No permite plugins (Flash, etc.)
//           upgradeInsecureRequests: [], // Convierte las peticiones HTTP a HTTPS
//         },
//       },
//       dnsPrefetchControl: {
//         allow: false, // No permite DNS Prefetching
//       },
//       frameguard: {
//         action: 'deny', // No permite que la página sea puesta en un frame (protección clickjacking)
//       },
//       hsts: {
//         maxAge: 63072000, // 2 años en segundos para Strict-Transport-Security
//         includeSubDomains: true, // Aplica a todos los subdominios
//         preload: true,
//       },
//       ieNoOpen: {
//         action: 'noopen', // Configura X-Download-Options para IE8+
//       },
//       noSniff: {
//         action: 'nosniff', // X-Content-Type-Options para evitar MIME sniffing
//       },
//       referrerPolicy: {
//         policy: 'no-referrer', // Configuración de Referrer-Policy
//       },
//     })
//   );

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('Run in port http://localhost:' + PORT));

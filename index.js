import 'dotenv/config';
import express  from "express";
import "./helpers/DataBase/conectdb.js";
import userRoutes from './routes/user.route.js';
import cors from 'cors'
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';

import i18next from 'i18next' ; //Se modifico
import middleware from 'i18next-http-middleware' ; //se modifico
import FsBackend from 'i18next-fs-backend' ; // se modifico

import helmet from 'helmet';

//Se configuro
i18next
  .use(FsBackend)
  .use(middleware.LanguageDetector)
  .init({
    fallbackLng: 'en',
    backend: {
      loadPath: './locales/{{lng}}.json',
    },  
    detection: {
      order: ['header', 'querystring'],
      caches: ['cookie'],
    },
  });


const app = express();

app.use(middleware.handle(i18next));//se configuro

  
  
// console.log("Hola db => ", process.env.URI_MONGO);
// console.log("Commit de seguridad")
console.log("Ultimo commit 21/02/2024 a las 08:05")
// console.log(i18next.services.resourceStore.data);
// console.log("el init")
// console.log(i18next.init());

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

app.use((req, res, next) => {
    console.log(req.headers['accept-language']);
    next();
  });
// app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded(
    {extended: false}
))
app.use('/api/user', userRoutes);
app.get('/api/language', (req, res) => {
    res.status(200).send();
  });
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

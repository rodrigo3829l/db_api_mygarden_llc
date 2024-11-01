import 'dotenv/config';
import express  from "express";
import jwt from 'jsonwebtoken';
import http from 'http'; // Necesario para crear el servidor con WebSockets
import { Server } from 'socket.io'; // Importar socket.io


import "./helpers/DataBase/conectdb.js";
import userRoutes from './routes/user.route.js';
import TypeServiceRouter from './routes/type.service.route.js'
import ServicesRouter from './routes/services.route.js'
import ScheduleServiceRouter from './routes/schedule.service.route.js'
import EmployedRouter from './routes/employed.router.js'
import AnswerRouter from './routes/asnwer.router.js'
import DatesRouter from './routes/dates.router.js'
import TypePayRouter from './routes/type.pay.router.js'
import ProductsRouter from './routes/products.route.js'
import PaysRouter from './routes/pays.router.js'
import CommentRouter from './routes/comment.router.js'
import FeatureRouter from './routes/feature.router.js'
import UnitRouter from './routes/unit.route.js'
import ProviderRouter from './routes/provider.router.js'
import SatisfactionRouter from './routes/satisfaction.router.js'
import NotificationsRouter from './routes/notifications.router.js';
import cors from 'cors'
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import i18next from 'i18next' ; //Se modifico
import middleware from 'i18next-http-middleware' ; //se modifico
import FsBackend from 'i18next-fs-backend' ; // se modifico
import helmet from 'helmet';




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

const whiteList = [process.env.ORIGIN1, process.env.ORIGIN2 , process.env.ORIGIN3, process.env.ORIGIN4, process.env.ORIGIN5, process.env.ORIGIN6, process.env.ORIGIN7]

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
app.set('trust proxy', true);
app.use(helmet());
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true, parameterLimit: 50000}));
app.use(express.json())
app.use(middleware.handle(i18next));//se configuro
app.use(express.urlencoded(
    {extended: false}
))
app.use(cookieParser());

app.use('/api/user', userRoutes);
app.use('/api/typeservice', TypeServiceRouter);
app.use('/api/services', ServicesRouter);
app.use('/api/schedule', ScheduleServiceRouter);
app.use('/api/employed', EmployedRouter);
app.use('/api/answer', AnswerRouter)
app.use('/api/dates', DatesRouter);
app.use('/api/typepay', TypePayRouter);
app.use('/api/products', ProductsRouter);
app.use('/api/pays', PaysRouter);
app.use('/api/comment', CommentRouter);
app.use('/api/feature', FeatureRouter);
app.use('/api/unit', UnitRouter);
app.use('/api/provider', ProviderRouter);
app.use('/api/satisfaction', SatisfactionRouter);
app.use('/api/notifications', NotificationsRouter); 

export default app
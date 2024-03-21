import 'dotenv/config';
import express  from "express";
import "./helpers/DataBase/conectdb.js";

import userRoutes from './routes/user.route.js';
import TypeServiceRouter from './routes/type.service.route.js'
import ServicesRouter from './routes/services.route.js'


import ScheduleServiceRouter from './routes/schedule.service.route.js'
import EmployedRouter from './routes/employed.router.js'


import DatesRouter from './routes/dates.router.js'
import TypePayRouter from './routes/type.pay.router.js'
import ProductsRouter from './routes/products.route.js'
import PaysRouter from './routes/pays.router.js'
import CommentRouter from './routes/comment.router.js'

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
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true, parameterLimit: 50000}));
app.use(express.json())
app.use(middleware.handle(i18next));//se configuro

console.log("Ultimo commit 20/03/2024 a las 08:20")

const whiteList = [process.env.ORIGIN1, process.env.ORIGIN2 , process.env.ORIGIN3, process.env.ORIGIN4, process.env.ORIGIN5]

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

app.use(express.urlencoded(
    {extended: false}
))

app.use('/api/user', userRoutes);
app.use('/api/typeservice', TypeServiceRouter);
app.use('/api/services', ServicesRouter);


app.use('/api/schedule', ScheduleServiceRouter);
app.use('/api/employed', EmployedRouter);




app.use('/api/dates', DatesRouter);
app.use('/api/typepay', TypePayRouter);
app.use('/api/products', ProductsRouter);
app.use('/api/pays', PaysRouter);
app.use('/api/comment', CommentRouter);


app.use(cookieParser());

app.set('trust proxy', true);
app.use(helmet());


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('Run in port http://localhost:' + PORT));


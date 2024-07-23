const Alexa = require('ask-sdk-core');
const axios = require('axios');
const moment = require('moment');
const i18n = require('i18next');
const sprintf = require('i18next-sprintf-postprocessor');
const aplEs = require('./apl-es');
const aplEn = require('./apl-en');
const CANCEL_ID = "CancelarServicio";
const FAREWELL_ID = "Farewell";
const HELP_ID = "Help";
const LOGIN_ID = "Login";
const SERVICE_DETAILS_ID = "ServiceDetails";
const STATUS_SERVICES_ID = "StatusServices";
const WELCOME_ID = "Welcome";
const ERROR_ID = "Error";

const persistenceAdapter = getPersistenceAdapter();

function getPersistenceAdapter() {
    function isAlexaHosted() {
        return process.env.S3_PERSISTENCE_BUCKET ? true : false;
    }
    const tableName = 'user_data_table';
    if (isAlexaHosted()) {
        const { S3PersistenceAdapter } = require('ask-sdk-s3-persistence-adapter');
        return new S3PersistenceAdapter({
            bucketName: process.env.S3_PERSISTENCE_BUCKET
        });
    } else {
        const { DynamoDbPersistenceAdapter } = require('ask-sdk-dynamodb-persistence-adapter');
        return new DynamoDbPersistenceAdapter({
            tableName: tableName,
            createTable: true
        });
    }
}

const languageStrings = require('./languaje.js')
const translateStatusToSpanish = (status) => {
    switch(status) {
        case 'quoting':
            return 'cotizando';
        case 'quoted':
            return 'cotizado';
        case 'development':
            return 'en desarrollo';
        case 'finish':
            return 'finalizado';
        default:
            return 'estado desconocido';
    }
};

const translateStatusToEnglish = (status) => {
    switch(status) {
        case 'cotizando':
            return 'quoting';
        case 'cotizado':
            return 'quoted';
        case 'en desarrollo':
            return 'development';
        case 'finalizado':
            return 'finish';
        default:
            return 'unknown status';
    }
}

const createDirectivePayload = (aplDocumentId, dataSources = {}, tokenId = "documentToken") => {
    return {
        type: "Alexa.Presentation.APL.RenderDocument",
        token: tokenId,
        document: {
            type: "Link",
            src: "doc://alexa/apl/documents/" + aplDocumentId
        },
        datasources: dataSources
    }
};

const LocalizationInterceptor = {
    process(handlerInput) {
        const localizationClient = i18n.init({
            lng: handlerInput.requestEnvelope.request.locale,
            resources: languageStrings
        });
        localizationClient.localize = function (...args) {
            const value = i18n.t(...args);
            return value;
        };
        handlerInput.t = function (...args) {
            return localizationClient.localize(...args);
        };
    }
};

const getAplData = (locale) => {
    if (locale.startsWith('es')) {
        return aplEs;
    } else {
        return aplEn;
    }
};

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    async handle(handlerInput) {
        try {
            const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
            const persistentAttributes = await handlerInput.attributesManager.getPersistentAttributes();
            const locale = Alexa.getLocale(handlerInput.requestEnvelope);
            const aplData = getAplData(locale);

            if (persistentAttributes.token && persistentAttributes.name) {
                sessionAttributes.token = persistentAttributes.token;
                sessionAttributes.name = persistentAttributes.name;
                sessionAttributes.email = persistentAttributes.email;
                handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

                try {
                    const response = await axios.get('https://db-api-mygarden.onrender.com/api/user/refresh', {
                        headers: {
                            Authorization: `Bearer ${persistentAttributes.token}`,
                            rol: 'client',
                        }
                    });

                    if (response.data.token) {
                        sessionAttributes.token = response.data.token;
                        sessionAttributes.name = response.data.name;
                        sessionAttributes.email = response.data.email;
                        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

                        handlerInput.attributesManager.setPersistentAttributes({
                            token: response.data.token,
                            name: response.data.name,
                            email: response.data.email
                        });
                        await handlerInput.attributesManager.savePersistentAttributes();

                        const speakOutput = handlerInput.t('WELCOME_BACK_MSG', { name: response.data.name });
                        if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
                            const aplDirective = createDirectivePayload(WELCOME_ID, aplData.Welcome);
                            handlerInput.responseBuilder.addDirective(aplDirective);
                        }

                        return handlerInput.responseBuilder
                            .speak(speakOutput)
                            .reprompt(speakOutput)
                            .getResponse();
                    } else {
                        throw new Error('Invalid token refresh response');
                    }
                } catch (error) {
                    console.log('Token refresh failed:', error);
                    const speakOutput = handlerInput.t('SESSION_EXPIRED_MSG');
                    if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
                        const apl = aplData.ErrorMesaje(speakOutput);
                        const aplDirective = createDirectivePayload(ERROR_ID, apl);
                        handlerInput.responseBuilder.addDirective(aplDirective);
                    }

                    return handlerInput.responseBuilder
                        .speak(speakOutput)
                        .reprompt(speakOutput)
                        .getResponse();
                }
            } else {
                const speakOutput = handlerInput.t('WELCOME_MSG');
                if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
                    const aplDirective = createDirectivePayload(WELCOME_ID, aplData.Welcome);
                    handlerInput.responseBuilder.addDirective(aplDirective);
                }

                return handlerInput.responseBuilder
                    .speak(speakOutput)
                    .reprompt(speakOutput)
                    .getResponse();
            }
        } catch (error) {
            console.error('Error in LaunchRequestHandler:', error);
            return handlerInput.responseBuilder
                .addDirective({
                    type: 'Dialog.Delegate',
                    updatedIntent: {
                        name: 'ErrorHandler'
                    }
                })
                .getResponse();
        }
    }
};
const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        try {
            const locale = Alexa.getLocale(handlerInput.requestEnvelope);
            const aplData = getAplData(locale);
            if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
                const aplDirective = createDirectivePayload(HELP_ID, aplData.Help);
                handlerInput.responseBuilder.addDirective(aplDirective);
            }
            const speakOutput = handlerInput.t('HELP_MSG');

            return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt(speakOutput)
                .getResponse();
        } catch (error) {
            console.error('Error in HelpIntentHandler:', error);
            return handlerInput.responseBuilder
                .addDirective({
                    type: 'Dialog.Delegate',
                    updatedIntent: {
                        name: 'ErrorHandler'
                    }
                })
                .getResponse();
        }
    }
};


const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        try {
            const locale = Alexa.getLocale(handlerInput.requestEnvelope);
            const aplData = getAplData(locale);
            if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
                const aplDirective = createDirectivePayload(FAREWELL_ID, aplData.Farewell);
                handlerInput.responseBuilder.addDirective(aplDirective);
            }
            const speakOutput = handlerInput.t('GOODBYE_MSG');

            return handlerInput.responseBuilder
                .speak(speakOutput)
                .withShouldEndSession(true) // Finaliza la sesión
                .getResponse();
        } catch (error) {
            console.error('Error in CancelAndStopIntentHandler:', error);
            return handlerInput.responseBuilder
                .addDirective({
                    type: 'Dialog.Delegate',
                    updatedIntent: {
                        name: 'ErrorHandler'
                    }
                })
                .getResponse();
        }
    }
};

const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        try {
            const speakOutput = handlerInput.t('FALLBACK_MSG');

            return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt(speakOutput)
                .getResponse();
        } catch (error) {
            console.error('Error in FallbackIntentHandler:', error);
            return handlerInput.responseBuilder
                .addDirective({
                    type: 'Dialog.Delegate',
                    updatedIntent: {
                        name: 'ErrorHandler'
                    }
                })
                .getResponse();
        }
    }
};

const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        try {
            console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
            return handlerInput.responseBuilder.getResponse();
        } catch (error) {
            console.error('Error in SessionEndedRequestHandler:', error);
            return handlerInput.responseBuilder
                .addDirective({
                    type: 'Dialog.Delegate',
                    updatedIntent: {
                        name: 'ErrorHandler'
                    }
                })
                .getResponse();
        }
    }
};

const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        try {
            const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
            const speakOutput = `You just triggered ${intentName}`;

            return handlerInput.responseBuilder
                .speak(speakOutput)
                .getResponse();
        } catch (error) {
            console.error('Error in IntentReflectorHandler:', error);
            return handlerInput.responseBuilder
                .addDirective({
                    type: 'Dialog.Delegate',
                    updatedIntent: {
                        name: 'ErrorHandler'
                    }
                })
                .getResponse();
        }
    }
};


const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const locale = Alexa.getLocale(handlerInput.requestEnvelope);
        const aplData = getAplData(locale);
         if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
            const apl = aplData.ErrorMesaje(handlerInput.t('ERROR_MSG'))
            const aplDirective = createDirectivePayload(ERROR_ID, apl);
            handlerInput.responseBuilder.addDirective(aplDirective);
        }
        const speakOutput = handlerInput.t('ERROR_MSG');
        console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CaptureEmailIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
               Alexa.getIntentName(handlerInput.requestEnvelope) === 'CaptureEmailIntent';
    },
    handle(handlerInput) {
        const locale = Alexa.getLocale(handlerInput.requestEnvelope);
        const aplData = getAplData(locale);
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);

        // Agregar manejo de la guía de uso
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        if (sessionAttributes.guideUserActive) {
            const speakOutput = handlerInput.t('GUIDE_USER_MSG', { intentName: intentName });
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt(speakOutput)
                .getResponse();
        }

        if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
            const apl = aplData.Login();
            const aplDirective = createDirectivePayload(LOGIN_ID, apl);
            handlerInput.responseBuilder.addDirective(aplDirective);
        }

        const email = "202106581@gmail.com";

        if (!validateEmail(email)) {
            const speakOutput = handlerInput.t('EMAIL_INVALID_MSG');
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt(speakOutput)
                .getResponse();
        }

        sessionAttributes.email = email;
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

        const speakOutput = handlerInput.t('EMAIL_RECEIVED_MSG');
        if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
            const apl = aplData.Login(speakOutput);
            const aplDirective = createDirectivePayload(LOGIN_ID, apl);
            handlerInput.responseBuilder.addDirective(aplDirective);
        }
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CapturePasswordIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
               Alexa.getIntentName(handlerInput.requestEnvelope) === 'CapturePasswordIntent';
    },
    async handle(handlerInput) {
        console.log("hola")
        const password = "Drop345terra#";
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        const email = sessionAttributes.email;
        const locale = Alexa.getLocale(handlerInput.requestEnvelope);
        const aplData = getAplData(locale);
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);

        // Agregar manejo de la guía de uso
        if (sessionAttributes.guideUserActive) {
            const speakOutput = handlerInput.t('GUIDE_USER_MSG', { intentName: intentName });
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt(speakOutput)
                .getResponse();
        }

        try {
            const response = await axios.post(
                "https://db-api-mygarden.onrender.com/api/user/login",
                {
                    email: email,
                    password: password,
                    department: "client",
                }
            );

            if (response.data.token) {
                const token = response.data.token;
                const name = response.data.name;

                sessionAttributes.token = token;
                sessionAttributes.name = name;
                handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

                await handlerInput.attributesManager.setPersistentAttributes({
                    token: token,
                    name: name,
                    email: email,
                });
                await handlerInput.attributesManager.savePersistentAttributes();

                const speakOutput = handlerInput.t("LOGIN_SUCCESS_MSG", { name: name });
                if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)["Alexa.Presentation.APL"]) {
                    const apl = aplData.Login(speakOutput);
                    const aplDirective = createDirectivePayload(LOGIN_ID, apl);
                    handlerInput.responseBuilder.addDirective(aplDirective);
                }

                return handlerInput.responseBuilder
                    .speak(speakOutput)
                    .reprompt(speakOutput)
                    .getResponse();
            } else {
                const speakOutput = handlerInput.t("LOGIN_FAILURE_MSG", {
                    error: response.data.error,
                });
                if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)["Alexa.Presentation.APL"]) {
                    const apl = aplData.Login(speakOutput);
                    const aplDirective = createDirectivePayload(LOGIN_ID, apl);
                    handlerInput.responseBuilder.addDirective(aplDirective);
                }
                return handlerInput.responseBuilder
                    .speak(speakOutput)
                    .reprompt(speakOutput)
                    .getResponse();
            }
        } catch (error) {
            console.log(error);
            const speakOutput = handlerInput.t("LOGIN_ERROR_MSG");
            if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)["Alexa.Presentation.APL"]) {
                const apl = aplData.Login(speakOutput);
                const aplDirective = createDirectivePayload(LOGIN_ID, apl);
                handlerInput.responseBuilder.addDirective(aplDirective);
            }
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt(speakOutput)
                .getResponse();
        }
    }
};



const StatusServicesIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'StatusServicesIntent';
    },
    async handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        const token = sessionAttributes.token;
        const locale = Alexa.getLocale(handlerInput.requestEnvelope);
        const aplData = getAplData(locale);
        const isSpanish = locale.startsWith('es');
        
        if (!token) {
            // Si el token no está disponible, pedir al usuario que inicie sesión
            const speakOutput = "No hay token";
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .getResponse();
        }
        
        try {
            const response = await makeApiRequest(token);

            if (response.success) {
                const services = response.services;

                if (services.length === 0) {
                    if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
                        const apl = aplData.ErrorMesaje(handlerInput.t('NO_SERVICES_MSG'))
                        const aplDirective = createDirectivePayload(ERROR_ID, apl);
                        handlerInput.responseBuilder.addDirective(aplDirective);
                    }
                    const speakOutput = handlerInput.t('NO_SERVICES_MSG');
                    return handlerInput.responseBuilder
                        .speak(speakOutput)
                        .getResponse();
                }
                
                // Guardar servicios en la sesión
                //handlerInput.attributesManager.setSessionAttributes({ services, currentIndex: 0 });
                
                // Mostrar primeros 6 servicios
                const firstSixServices = services.slice(0, 6);
                const apl = aplData.StatusServices(firstSixServices);
                const aplDirective = createDirectivePayload(STATUS_SERVICES_ID, apl);

                let speechOutput = handlerInput.t('SERVICES_STATUS_MSG');
                firstSixServices.forEach(service => {
                    const formattedDate = moment(service.dates.scheduledTime).format('DD/MM/YYYY');
                    if (isSpanish) {
                        speechOutput += `El servicio ${service.description} con fecha reservada el ${formattedDate} está ${translateStatusToSpanish(service.status)}. `;
                    } else {
                        speechOutput += `The service ${service.description} scheduled on ${formattedDate} is ${service.status}. `;
                    }
                });

                return handlerInput.responseBuilder
                    .speak(speechOutput)
                    .addDirective(aplDirective)
                    .reprompt(speechOutput)
                    .getResponse();
            } else {
                const errorMsg = response.msg || handlerInput.t('SERVICES_FETCH_ERROR_MSG');
                const speakOutput = `${handlerInput.t('ERROR_MSG')} ${errorMsg}`;
                if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
                    const apl = aplData.ErrorMesaje(speakOutput);
                    const aplDirective = createDirectivePayload(ERROR_ID, apl);
                    handlerInput.responseBuilder.addDirective(aplDirective);
                }
                return handlerInput.responseBuilder
                    .speak(speakOutput)
                    .reprompt(speakOutput)
                    .getResponse();
            }
        } catch (error) {
            console.error('Error in StatusServicesIntentHandler:', error);
            const speakOutput = handlerInput.t('SERVICES_FETCH_ERROR_MSG');
            if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
                const apl = aplData.ErrorMesaje(speakOutput);
                const aplDirective = createDirectivePayload(ERROR_ID, apl);
                handlerInput.responseBuilder.addDirective(aplDirective);
            }
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt(speakOutput)
                .getResponse();
        }
    }
};


const StatusSpecificServicesIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'StatusSpecificServicesIntent';
    },
    async handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        const token = sessionAttributes.token;
        const status = Alexa.getSlotValue(handlerInput.requestEnvelope, 'status');
        const locale = Alexa.getLocale(handlerInput.requestEnvelope);
        const aplData = getAplData(locale);
        const translateStatus = (locale.startsWith('es')) ? translateStatusToEnglish(status) : status;
        if (!token) {
            // Si el token no está disponible, pedir al usuario que inicie sesión
            const speakOutput = "No hay token";
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .getResponse();
        }
        try {
            const response = await makeApiRequest(token);

            if (response.success) {
                const services = response.services.filter(service => service.status.toLowerCase() === translateStatus.toLowerCase());

                if (services.length === 0) {
                    const speakOutput = handlerInput.t('NO_SERVICES_STATUS_MSG', { status });
                    if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
                        const apl = aplData.ErrorMesaje(speakOutput);
                        const aplDirective = createDirectivePayload(ERROR_ID, apl);
                        handlerInput.responseBuilder.addDirective(aplDirective);
                    }
                    return handlerInput.responseBuilder
                        .speak(speakOutput)
                        .getResponse();
                }

                // Guardar servicios en la sesión
               // handlerInput.attributesManager.setSessionAttributes({ services, currentIndex: 0 });

                // Mostrar primeros 6 servicios
                const firstSixServices = services.slice(0, 6);
                const apl = aplData.StatusServices(firstSixServices);
                const aplDirective = createDirectivePayload(STATUS_SERVICES_ID, apl);

                let speechOutput = handlerInput.t('SERVICES_WITH_STATUS_MSG', { status });
                firstSixServices.forEach(service => {
                    const formattedDate = moment(service.dates.scheduledTime).format('DD/MM/YYYY');
                    speechOutput += handlerInput.t('SERVICE_DETAIL_MSG', { description: service.description, date: formattedDate });
                });

                return handlerInput.responseBuilder
                    .speak(speechOutput)
                    .addDirective(aplDirective)
                    .reprompt(speechOutput)
                    .getResponse();
            } else {
                const errorMsg = response.msg || handlerInput.t('SERVICES_ERROR_MSG');
                const speakOutput = `${handlerInput.t('ERROR_MSG')} ${errorMsg}`;
                if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
                    const apl = aplData.ErrorMesaje(speakOutput);
                    const aplDirective = createDirectivePayload(ERROR_ID, apl);
                    handlerInput.responseBuilder.addDirective(aplDirective);
                }
                return handlerInput.responseBuilder
                    .speak(speakOutput)
                    .reprompt(speakOutput)
                    .getResponse();
            }
        } catch (error) {
            console.error('Error in StatusSpecificServicesIntentHandler:', error);
            const speakOutput = handlerInput.t('SERVICES_ERROR_MSG');
            if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
                const apl = aplData.ErrorMesaje(speakOutput);
                const aplDirective = createDirectivePayload(ERROR_ID, apl);
                handlerInput.responseBuilder.addDirective(aplDirective);
            }
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt(speakOutput)
                .getResponse();
        }
    }
};


const ShowNextServicesIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ShowNextServicesIntent';
    },
    handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        const { services, currentIndex } = sessionAttributes;

        const nextIndex = currentIndex + 6;
        const nextServices = services.slice(nextIndex, nextIndex + 6);

        if (nextServices.length === 0) {
            const speakOutput = handlerInput.t('NO_MORE_SERVICES_MSG');
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .getResponse();
        }

        // Actualizar índice actual
        //handlerInput.attributesManager.setSessionAttributes({ services, currentIndex: nextIndex });

        const aplData = getAplData(Alexa.getLocale(handlerInput.requestEnvelope));
        const apl = aplData.StatusServices(nextServices);
        const aplDirective = createDirectivePayload(STATUS_SERVICES_ID, apl);

        let speechOutput = handlerInput.t('NEXT_SERVICES_MSG');
        nextServices.forEach(service => {
            const formattedDate = moment(service.dates.scheduledTime).format('DD/MM/YYYY');
            if (Alexa.getLocale(handlerInput.requestEnvelope).startsWith('es')) {
                speechOutput += `El servicio ${service.description} con fecha reservada el ${formattedDate} está ${translateStatusToSpanish(service.status)}. `;
            } else {
                speechOutput += `The service ${service.description} scheduled on ${formattedDate} is ${service.status}. `;
            }
        });

        return handlerInput.responseBuilder
            .speak(speechOutput)
            .addDirective(aplDirective)
            .reprompt(speechOutput)
            .getResponse();
    }
};



const ServiceDetailsIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ServiceDetailsIntent';
    },
    async handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        const token = sessionAttributes.token;
        const serviceDescription = Alexa.getSlotValue(handlerInput.requestEnvelope, 'serviceDescription');
        const locale = Alexa.getLocale(handlerInput.requestEnvelope);
        const aplData = getAplData(locale);
        if (!token) {
            // Si el token no está disponible, pedir al usuario que inicie sesión
            const speakOutput = "No hay token";
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .getResponse();
        }
        try {
            // Obtener todos los servicios
            const response = await makeApiRequest(token);

            if (!response.success) {
                const errorMsg = response.msg || handlerInput.t('SERVICES_ERROR_MSG');
                const speakOutput = `${handlerInput.t('ERROR_MSG')} ${errorMsg}`;
                if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
                    const apl = aplData.ErrorMesaje(speakOutput)
                    const aplDirective = createDirectivePayload(ERROR_ID, apl);
                    handlerInput.responseBuilder.addDirective(aplDirective);
                }
                return handlerInput.responseBuilder
                    .speak(speakOutput)
                    .reprompt(speakOutput)
                    .getResponse();
            }

            const allServices = response.services;
            const matchingService = allServices.find(service => service.description.toLowerCase() === serviceDescription.toLowerCase());

            if (!matchingService) {
                const speakOutput = handlerInput.t('SERVICE_NOT_FOUND_MSG', { serviceDescription });
                if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
                    const apl = aplData.ErrorMesaje(speakOutput)
                    const aplDirective = createDirectivePayload(ERROR_ID, apl);
                    handlerInput.responseBuilder.addDirective(aplDirective);
                }
                return handlerInput.responseBuilder
                    .speak(speakOutput)
                    .reprompt(speakOutput)
                    .getResponse();
            }

            const serviceId = matchingService._id;

            // Obtener detalles del servicio específico
            const serviceDetailsResponse = await axios.get(`https://db-api-mygarden.onrender.com/api/schedule/scheduleservice/${serviceId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    rol: 'client',
                }
            });

            if (!serviceDetailsResponse.data.success) {
                const errorMsg = serviceDetailsResponse.data.msg || handlerInput.t('SERVICES_ERROR_MSG');
                const speakOutput = `${handlerInput.t('ERROR_MSG')} ${errorMsg}`;
                if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
                    const apl = aplData.ErrorMesaje(speakOutput)
                    const aplDirective = createDirectivePayload(ERROR_ID, apl);
                    handlerInput.responseBuilder.addDirective(aplDirective);
                }
                return handlerInput.responseBuilder
                    .speak(speakOutput)
                    .reprompt(speakOutput)
                    .getResponse();
            }
            
            const service = serviceDetailsResponse.data.newService;
            let speechOutput = handlerInput.t('SERVICE_DETAIL_INFO_MSG', { service: service.service, description: service.description });
            let datasource
            const translateStatus = (locale.startsWith('es')) ? translateStatusToEnglish(service.status) : service.status
            if (service.status !== 'quoting') {
                datasource = aplData.ServiceDetails(
                            service.img,
                            translateStatus,
                            service.quote,
                            service.pending,
                            service.additionalCosts.labor,
                            service.description,
                            service.service,
                            service.additionalCosts.machinery
                        );
                const formattedDate = moment(service.dates.scheduledTime).format('DD/MM/YYYY');
                speechOutput += handlerInput.t('SERVICE_STATUS_MSG', { status: translateStatus, scheduledDate: formattedDate, quote: service.quote });

                if (service.products && service.products.length > 0) {
                    speechOutput += handlerInput.t('SERVICE_PRODUCTS_MSG');
                    service.products.forEach(product => {
                        speechOutput += handlerInput.t('SERVICE_PRODUCT_DETAIL_MSG', { product: product.product, quantity: product.quantity, total: product.total });
                    });
                }

                if (service.additionalCosts) {
                    speechOutput += handlerInput.t('SERVICE_ADDITIONAL_COSTS_MSG', { labor: service.additionalCosts.labor, machinery: service.additionalCosts.machinery });
                }

                if (service.employeds && service.employeds.length > 0) {
                    speechOutput += handlerInput.t('SERVICE_EMPLOYEES_MSG', { employees: service.employeds.join(', ') });
                }
            } else {
                datasource = aplData.ServiceDetails(
                            service.img,
                            translateStatus,
                            0,
                            0,
                            0,
                            service.description,
                            service.service,
                            0
                        );
                const formattedDate = moment(service.dates.scheduledTime).format('DD/MM/YYYY');
                const reservedDate = moment(service.dates.reserved).format('DD/MM/YYYY');
                speechOutput += handlerInput.t('SERVICE_QUOTING_STATUS_MSG', { status: translateStatus, scheduledDate: formattedDate, reservedDate: reservedDate });
            }
            if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
                
                const aplDirective = createDirectivePayload(SERVICE_DETAILS_ID, datasource);
                handlerInput.responseBuilder.addDirective(aplDirective);
            }
            return handlerInput.responseBuilder
                .speak(speechOutput)
                .reprompt(speechOutput)
                .getResponse();

        } catch (error) {
            console.error('Error in ServiceDetailsIntentHandler:', error);
            console.log(error);
            const speakOutput = handlerInput.t('SERVICES_ERROR_MSG');
            if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
                const apl = aplData.ErrorMesaje(speakOutput)
                const aplDirective = createDirectivePayload(ERROR_ID, apl);
                handlerInput.responseBuilder.addDirective(aplDirective);
            }
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt(speakOutput)
                .getResponse();
        }
    }
};

const CancelServiceIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'CancelServiceIntent';
    },
    async handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        const token = sessionAttributes.token;
        const serviceDescription = Alexa.getSlotValue(handlerInput.requestEnvelope, 'serviceDescription');
        const locale = Alexa.getLocale(handlerInput.requestEnvelope);
        const aplData = getAplData(locale);
        if (!token) {
            // Si el token no está disponible, pedir al usuario que inicie sesión
            const speakOutput = "No hay token";
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .getResponse();
        }
        try {
            const response = await makeApiRequest(token);

            if (!response.success) {
                const errorMsg = response.msg || handlerInput.t('CANCEL_SERVICE_ERROR_MSG');
                const speakOutput = `${errorMsg}`;
                if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
                    const apl = aplData.ErrorMesaje(speakOutput)
                    const aplDirective = createDirectivePayload(ERROR_ID, apl);
                    handlerInput.responseBuilder.addDirective(aplDirective);
                }
                return handlerInput.responseBuilder
                    .speak(speakOutput)
                    .reprompt(speakOutput)
                    .getResponse();
            }

            const allServices = response.services;
            const matchingService = allServices.find(service => service.description.toLowerCase() === serviceDescription.toLowerCase());

            if (!matchingService) {
                const speakOutput = handlerInput.t('CANCEL_SERVICE_NOT_FOUND_MSG', { serviceDescription });
                if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
                    const apl = aplData.ErrorMesaje(speakOutput)
                    const aplDirective = createDirectivePayload(ERROR_ID, apl);
                    handlerInput.responseBuilder.addDirective(aplDirective);
                }
                return handlerInput.responseBuilder
                    .speak(speakOutput)
                    .reprompt(speakOutput)
                    .getResponse();
            }

            const serviceId = matchingService._id;

            // Cancelar el servicio específico
            const cancelServiceResponse = await axios.put(`https://db-api-mygarden.onrender.com/api/schedule/cancel/${serviceId}`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    rol: 'client',
                }
            });

            if (!cancelServiceResponse.data.success) {
                const errorMsg = cancelServiceResponse.data.msg || handlerInput.t('CANCEL_SERVICE_ERROR_MSG');
                const speakOutput = `${errorMsg}`;
                if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
                    const apl = aplData.ErrorMesaje(speakOutput)
                    const aplDirective = createDirectivePayload(ERROR_ID, apl);
                    handlerInput.responseBuilder.addDirective(aplDirective);
                }
                return handlerInput.responseBuilder
                    .speak(speakOutput)
                    .reprompt(speakOutput)
                    .getResponse();
            }

            const successMsg = cancelServiceResponse.data.msg || handlerInput.t('CANCEL_SERVICE_SUCCESS_MSG');
            const speakOutput = successMsg;
            if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
                const apl = aplData.CancelService
                const aplDirective = createDirectivePayload(CANCEL_ID, apl);
                handlerInput.responseBuilder.addDirective(aplDirective);
            }
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt(speakOutput)
                .getResponse();
        } catch (error) {
            console.error('Error in cencelsERVICE:', error);
            const speakOutput = handlerInput.t('CANCEL_SERVICE_ERROR_MSG');
            if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
                const apl = aplData.ErrorMesaje(speakOutput)
                const aplDirective = createDirectivePayload(ERROR_ID, apl);
                handlerInput.responseBuilder.addDirective(aplDirective);
            }
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt(speakOutput)
                .getResponse();
        }
    }
};

const makeApiRequest = async (token) => {
    try {
        console.log('Making API request with token:', token);
        const response = await axios.get('https://db-api-mygarden.onrender.com/api/schedule/userservices', {
            headers: {
                Authorization: `Bearer ${token}`,
                rol: 'client',
            }
        });
        console.log('API response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error making API request:', error);
        throw error;
    }
};


const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const LoadAttributesRequestInterceptor = {
    async process(handlerInput) {
        if (handlerInput.requestEnvelope.session['new']) {
            const { attributesManager } = handlerInput;
            const persistentAttributes = await attributesManager.getPersistentAttributes() || {};
            console.log('Loaded persistent attributes:', persistentAttributes);
            handlerInput.attributesManager.setSessionAttributes(persistentAttributes);
        }
    }
};

const SaveAttributesResponseInterceptor = {
    async process(handlerInput, response) {
        const { attributesManager } = handlerInput;
        const sessionAttributes = attributesManager.getSessionAttributes();
        const shouldEndSession = (typeof response.shouldEndSession === "undefined" ? true : response.shouldEndSession);
        if (shouldEndSession || handlerInput.requestEnvelope.request.type === 'SessionEndedRequest') {
            attributesManager.setPersistentAttributes(sessionAttributes);
            await attributesManager.savePersistentAttributes();
            console.log('Saved persistent attributes:', sessionAttributes);
        }
    }
};


const LogOutIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'LogOutIntent';
    },
    async handle(handlerInput) {
        // Clear session and persistent attributes
        handlerInput.attributesManager.setSessionAttributes({});
        handlerInput.attributesManager.setPersistentAttributes({});
        await handlerInput.attributesManager.savePersistentAttributes();

        const speakOutput = handlerInput.t('LOGOUT_SUCCESS_MSG');
        
        const locale = Alexa.getLocale(handlerInput.requestEnvelope);
        const aplData = getAplData(locale);
        if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
            const apl = aplData.ErrorMesaje(speakOutput)
            const aplDirective = createDirectivePayload(ERROR_ID, apl);
            handlerInput.responseBuilder.addDirective(aplDirective);
        }

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .withShouldEndSession(true)
            .getResponse();
    }
};
const GuideUserIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'GuideUserIntent';
    },
    handle(handlerInput) {
        const speakOutput = handlerInput.t('GUIDE_USER_MSG');
        const locale = Alexa.getLocale(handlerInput.requestEnvelope);
        const aplData = getAplData(locale);

        /*if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
            const aplDirective = createDirectivePayload(GUIDE_USER_ID, aplData.GuideUser);
            handlerInput.responseBuilder.addDirective(aplDirective);
        }*/

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(handlerInput.t('GUIDE_USER_REPROMPT'))
            .getResponse();
    }
};
const ServiceStatusListIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ServiceStatusListIntent';
    },
    handle(handlerInput) {
        const speakOutput = handlerInput.t('SERVICE_STATUS_LIST_MSG');
        const locale = Alexa.getLocale(handlerInput.requestEnvelope);
        const aplData = getAplData(locale);

        /*if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
            const aplDirective = createDirectivePayload(SERVICE_STATUS_LIST_ID, aplData.ServiceStatusList);
            handlerInput.responseBuilder.addDirective(aplDirective);
        }*/

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(handlerInput.t('SERVICE_STATUS_LIST_REPROMPT'))
            .getResponse();
    }
};


exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        CaptureEmailIntentHandler,
        CapturePasswordIntentHandler,
        StatusServicesIntentHandler,
        StatusSpecificServicesIntentHandler,
        ServiceDetailsIntentHandler,
        ShowNextServicesIntentHandler,
        CancelServiceIntentHandler,
        LogOutIntentHandler,
        GuideUserIntentHandler,
        ServiceStatusListIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler
    )
    .addRequestInterceptors(
        LocalizationInterceptor,
        LoadAttributesRequestInterceptor // Agregar aquí el interceptor de carga de atributos
    )
    .addResponseInterceptors(
        SaveAttributesResponseInterceptor // Agregar aquí el interceptor de guardado de atributos
    )
    .addErrorHandlers(ErrorHandler)
    .withPersistenceAdapter(persistenceAdapter) 
    .lambda();
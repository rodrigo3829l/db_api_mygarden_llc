import nodemailer from "nodemailer";

const mail = {
    user: process.env.USER,
    password: process.env.PASSWORD
}

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: mail.user,
        pass: mail.password,
    },
});


export const sendEmail = async (email, subject, html, text) => {
    try {
        await transporter.sendMail({
            from:`My Garden LLC <${mail.user}>` , 
            to: email,
            subject,
            text, 
            html
        });
    } catch (error) {
        console.log("Algo salio mal al enviar email", error)
    }
}
export const getTemplate = (titleOne, titleTwo, prOne, prTwo, name, code, action, textAction) => {
    let accion = ''
    
    if (action === "confirm"){
        // accion = `<a href="https://db-api-mygarden.onrender.com/api/user/confirm/${code}" target="_blank">${textAction}</a>`
        accion = `<a href="http://localhost:5000/api/user/confirm/${code}" target="_blank">${textAction}</a>`
    }
    else if (action === 'reactivated'){
        // accion = `<a href="https://db-api-mygarden.onrender.com/api/user/reactivate/${code}" target="_blank">${textAction}</a>`
        accion = `<a href="http://localhost:5000/api/user/reactivate/${code}" target="_blank">${textAction}</a>`
    }
    else if(action === 'recover'){
        accion = `<div class="verification-code">${code}</div>`
    }
    else{
        accion = ` <div class="verification-code">${textAction}</div>`
    }
    return `
    
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to the Garden!</title>
    <style>
        body {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            background-color: #e9f7ef;
            margin: 0;
            font-family: 'Courier New', Courier, monospace;
            color: #34552c;
        }
        .text-center {
            text-align: center;
            width: 90%;
            max-width: 600px;
            padding: 20px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            background-color: #ffffff;
            border-radius: 8px;
        }
        img {
            border-radius: 50%;
            max-width: 120px;
            border: 4px solid #81c784;
        }
        h2 {
            margin-top: 1em;
            color: #388e3c;
        }
        p {
            font-size: 1em;
            line-height: 1.5;
        }
        a {
            display: inline-block;
            color: white;
            background-color: #388e3c;
            padding: 10px 20px;
            margin-top: 20px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            box-shadow: 0 2px 2px rgba(0,0,0,0.2);
            transition: background-color 0.3s ease;
        }
        a:hover {
            background-color: #4caf50;
        }
        .verification-code {
            font-size: 1.2em;
            font-weight: bold;
            color: #28a745;
            padding: 10px;
            margin-top: 20px;
            border: 1px dashed #28a745;
            display: inline-block;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <div class="text-center">
        <!-- Image -->
        <img src="https://res.cloudinary.com/dui4i9f4e/image/upload/v1705842820/logos/aoi6pnl5zuzhwsbalygr.jpg" alt="Garden Logo">
        
        <!-- Welcome User -->
        <h2>${titleOne}, ${name}, ${titleTwo}</h2>
        
        <!-- Confirmation Message -->
        <p>${prOne}</p>
        
        <!-- Verification Code -->
        ${accion}
        
        <!-- Additional Information -->
        <p>${prTwo}</p>
    </div>
</body>
    `
}

export const getAdminTemplate  = (userName, servicio, fecha, action) =>{
    let content;
    if(action === 'agendado' || action === 'reagendado'){
        content = `
            <p>El usuario: <strong>${userName}</strong>, ha ${action} el servicio: <strong>${servicio}</strong> para la siguiente fecha: <strong>${fecha}</strong>.</p>
            <p>Por favor confirmar que se hará la visita al cliente. En caso contrario, reagendarla.</p>
        `
    } else if(action == 'cancelado'){
        content =  `
            <p>El usuario: <strong>${userName}</strong>, ha ${action} el servicio: <strong>${servicio}</strong> con fecha del: <strong>${fecha}</strong>.</p>
            <p>Por favor tomar medidas necesarias con los datos.</p>
        `
    }

    return `
    <html lang="en">
<head>
    <title>Notificación de Servicio Agendado</title>
    <style>
        body {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            background-color: #f5f5f5;
            margin: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #333;
        }
        .container {
            text-align: center;
            width: 90%;
            max-width: 600px;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
            background-color: #ffffff;
        }
        .logo {
            border-radius: 50%;
            max-width: 120px;
            border: 4px solid #81c784;
            margin-bottom: 20px;
        }
        .title {
            margin-top: 20px;
            color: #388e3c;
            font-size: 24px;
        }
        .message {
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 20px;
        }
        .verification-code {
            font-size: 18px;
            font-weight: bold;
            color: #28a745;
            padding: 10px;
            margin-top: 20px;
            border: 2px dashed #28a745;
            display: inline-block;
            border-radius: 5px;
        }
        .footer {
            font-size: 14px;
            color: #777;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        
        <img class="logo" src="https://res.cloudinary.com/dui4i9f4e/image/upload/v1705842820/logos/aoi6pnl5zuzhwsbalygr.jpg" alt="My Garden LLC Logo">
        <div class="title">My Garden LLC</div> 
        <div class="message">
            <p>Hola Admin,</p>
            ${content}
        </div>
        <div class="footer">Este es un mensaje automático. Por favor no responder.</div>
    </div>
</body>
</html>

    
    `
}

export const getContactTemplate = (name, email, message) =>{
    return `
        
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Contacto - My Garden LLC</title>
<style>
    body {
margin: 0;
padding: 0;
font-family: Arial, sans-serif;
background-color: #f0f0f0;
}

.container {
width: 80%;
margin: 50px auto;
background-color: #fff;
border-radius: 20px;
overflow: hidden;
box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
}

.logo-container {
text-align: center;
padding: 20px 0;
}

.logo {
width: 150px;
height: 150px;
border-radius: 50%;
}

.message-container {
padding: 20px;
}

h1 {
color: #008000; /* Verde */
}

.message {
background-color: #f0f8ff; /* Azul claro */
padding: 10px;
border-radius: 10px;
margin-bottom: 20px;
}

p {
line-height: 1.5;
color: #333;
}

</style>
</head>
<body>
<div class="container">
    <div class="logo-container">
        <img class="logo" src="https://res.cloudinary.com/dui4i9f4e/image/upload/v1705842820/logos/aoi6pnl5zuzhwsbalygr.jpg" alt="My Garden LLC Logo">
    </div>
    <div class="message-container">
        <h1>¡Hola amante de las plantas!</h1>
        <p>El usuario: ${name}, con correo: ${email} interesado en el cuidado de las plantas se ha puesto en contacto contigo. Aquí está su mensaje:</p>
        <div class="message">
            <!-- Aquí va el mensaje del usuario -->
            <p>${message}</p>
        </div>
        <p>¡Gracias por tu atención y espero tu pronta respuesta!</p>
        <p>Atentamente,<br>El equipo de My Garden LLC</p>
    </div>
</div>
</body>

    
    `
}
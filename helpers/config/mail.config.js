import nodemailer from "nodemailer";

const mail = {
    user: 'mygardenllc1526@gmail.com',
    password: 'bviu fzan ovzz rloi'
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


export const sendEmail = async (email, subject, html) => {
    try {
        await transporter.sendMail({
            from:`My Garden LLC <${mail.user}>` , 
            to: email,
            subject,
            text: "Confirm your acount", 
            html
        });
    } catch (error) {
        console.log("Algo salio mal al enviar email", error)
    }
}
export const getTemplate = (name, token) => {
    return `
    <head>
        <title>Welcome</title>
        <style>
            body {
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100vh;
                background-color: #f8f9fa;
                margin: 0;
                font-family: Arial, sans-serif;
            }
            .text-center {
                text-align: center;
            }
            img {
                border-radius: 50%;
                max-width: 200px;
            }
            h2 {
                margin-top: 1em;
            }
            p {
                font-size: 1.5em;
            }
            a {
                display: inline-block;
                color: white;
                background-color: #28a745;
                padding: 0.5em 1em;
                margin-top: 1em;
                text-decoration: none;
                border-radius: 0.25em;
            }
        </style>
    </head>
    <body>
        <div class="text-center">
            <!-- Image -->
            <img src="https://res.cloudinary.com/dui4i9f4e/image/upload/v1705842820/logos/aoi6pnl5zuzhwsbalygr.jpg" alt="Logo">
            
            <!-- Welcome User -->
            <h2>Welcome ${name}</h2>
            
            <!-- Confirmation Message -->
            <p>To confirm your account, please click on the following link:</p>
            
            <!-- Link to confirm the account -->
            <a href="http://localhost:5000/api/user/confirm/${token}" target="_blank">Confirm Account</a>
        </div>
    </body>
    </html>
    
    `
}

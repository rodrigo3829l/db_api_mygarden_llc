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
export const getTemplate = (name, code, action) => {
    if(action === "confirm"){
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
        </style>
    </head>
    <body>
        <div class="text-center">
            <!-- Image -->
            <img src="https://res.cloudinary.com/dui4i9f4e/image/upload/v1705842820/logos/aoi6pnl5zuzhwsbalygr.jpg" alt="Garden Logo">
            
            <!-- Welcome User -->
            <h2>Welcome ${name}, to our gardening community!</h2>
            
            <!-- Confirmation Message -->
            <p>We're thrilled to have you join us on this green journey! To put down roots and start blooming together, all you need to do is confirm your account.</p>
            
            <!-- Link to confirm the account -->
            <a href="http://localhost:5000/api/user/confirm/${code}" target="_blank">Confirm Account</a>
        </div>
    </body>
    
    `
    }
    else if(action === 'reactivated'){
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
    </style>
</head>
<body>
    <div class="text-center">
        <!-- Image -->
        <img src="https://res.cloudinary.com/dui4i9f4e/image/upload/v1705842820/logos/aoi6pnl5zuzhwsbalygr.jpg" alt="Garden Logo">
        
        <!-- Welcome User -->
        <h2>Oh no, Gardener!</h2>
        
        <!-- Reactivation Message -->
        <p>It seems like your garden gate got locked after too many attempts to enter. No worries, though! Let's get you back in so you can continue tending to your beautiful garden. Just click the button below to unlock the gate and reactivate your account:</p>
        
        <!-- Button to reactivate the account -->
        <a href="http://localhost:5000/api/user/reactivate/${code}" target="_blank">Unlock & Reactivate Account</a>
    </div>
</body>
        `
    }
    else if(action === 'recover'){
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
            <h2>Seed of Change, ${name}</h2>
            
            <!-- Confirmation Message -->
            <p>Looks like you're planting a new seed for your account security! Here's the special code to sprout a new password:</p>
            
            <!-- Verification Code -->
            <div class="verification-code">${code}</div>
            
            <p>Enter this code on the password reset page to bloom a fresh, secure password for your garden's gate.</p>
        </div>
</body>
    
    `
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
        <h2>Oh no, ${name}, there's a problem!</h2>
        
        <!-- Confirmation Message -->
        <p>It seems someone is attempting to access your account.</p>
        
        <!-- Verification Code -->
        <div class="verification-code">If this wasn't you, please disregard</div>
        
        <!-- Additional Information -->
        <p>This is a security warning. If it was indeed you, ${name}, please consider resetting your password to prevent the account from being blocked.</p>
    </div>
</body>
    `
}

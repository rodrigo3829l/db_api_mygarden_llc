import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../app.js'; // Importa tu aplicación de Express


describe('Poblar la base de datos con 1,000 usuarios', () => {

    // Función para generar una fecha de nacimiento aleatoria entre 1970 y 2000
    const getRandomBirthdate = () => {
        const start = new Date(1970, 0, 1); // Enero 1, 1970
        const end = new Date(2000, 11, 31); // Diciembre 31, 2000
        return new Date(
            start.getTime() + Math.random() * (end.getTime() - start.getTime())
        ).toISOString().split('T')[0];
    };

    it('Debería crear 1,000 usuarios con datos generados aleatoriamente', async () => {
        const nombresMujeres = [
            "Sofía", "Isabella", "Valentina", "Camila", "Mariana", "Lucía", "Victoria", 
            "Renata", "Emma", "Paula", "Fernanda", "Gabriela", "Valeria", "Claudia", 
            "Andrea", "Daniela", "Carla", "Laura", "Natalia", "Catalina", "Anastasia", 
            "Elena", "Sandra", "Mónica", "Susana", "Gloria", "Patricia", "Olivia", 
            "Aurora", "Jimena", "Alicia", "Beatriz", "Diana", "Estela", "Fiorella", 
            "Georgina", "Isabel", "Julia", "Karen", "Lilian", "Marta", "Nina", 
            "Oriana", "Pilar", "Quintina", "Rocío", "Samantha", "Tatiana", "Ursula", 
            "Vanessa", "Wendy", "Ximena", "Yolanda", "Zaira", "Adriana", "Bianca", 
            "Cristina", "Dolores", "Eugenia", "Fabiola", "Graciela", "Helena", 
            "Irene", "Jazmín", "Karla", "Leonor", "Marisa", "Norma", "Ofelia", 
            "Paola", "Raquel", "Silvia", "Teresa", "Ursula", "Verónica", "Wendy", 
            "Yara", "Zoé", "Amelia", "Bella", "Carolina", "Débora", "Eva", "Flavia", 
            "Gabriella", "Helena", "Isidora", "Janet", "Katia", "Lorena", "Marisa", 
            "Nancy", "Olga", "Penélope", "Rita", "Sara", "Tamara",
            "Aurora", "Beatriz", "Carolina", "Diana", "Elvira", "Florencia",
          "Georgina", "Helena", "Ingrid", "Jazmín", "Karina", "Lorena",
          "Marisa", "Nadia", "Olga", "Patricia", "Raquel", "Sandra",
          "Teresa", "Ursula", "Verónica", "Wendy", "Ximena", "Yolanda",
          "Zulema", "Adela", "Berta", "Carla", "Delia", "Elsa", "Fabiola",
          "Gabriela", "Helena", "Isidora", "Janet", "Katia", "Leonor",
          "Margarita", "Nina", "Olivia", "Paloma", "Rebeca", "Sonia",
          "Tatiana", "Valeria", "Yolanda", "Ana", "Bella", "Clara", "Delfina",
          "Emilia", "Fernanda", "Graciela", "Helga", "Irina", "Jessica",
          "Karla", "Liliana", "Marta", "Natalia", "Ofelia", "Pilar", "Quintina",
          "Rosa", "Sara", "Tamara", "Valentina", "Yara", "Zoé", "Alejandra",
          "Brenda", "Camila", "Daniela", "Evelyn", "Felicia", "Gabriela",
          "Helena", "Isabella", "Jessica", "Karina", "Leticia", "Mariana",
          "Nuria", "Oriana", "Pilar", "Renata", "Sandra", "Sofía", "Teresa",
          "Vanessa", "Wendy", "Xenia", "Yasmín", "Zaira", "Alicia", "Bianca"
          ];
          
          // Arreglo con nombres de hombres (100 elementos)
          const nombresHombres = [
            "Juan", "Pedro", "Miguel", "Carlos", "José", "Antonio", "Diego", 
            "Santiago", "Emilio", "Fernando", "Jorge", "Ricardo", "Eduardo", 
            "Alejandro", "Manuel", "Luis", "Ernesto", "Alberto", "Roberto", 
            "Federico", "Arturo", "Joaquín", "Gustavo", "Daniel", "Héctor", 
            "Tomás", "Sebastián", "Enrique", "Iván", "Ramón", "Rafael", 
            "Oscar", "Mauricio", "Adrián", "Gilberto", "Gregorio", "Humberto", 
            "Ignacio", "Javier", "Leonardo", "Marcos", "Nicolás", "Omar", 
            "Pablo", "Quique", "Raúl", "Samuel", "Teodoro", "Ulises", 
            "Víctor", "Wilfredo", "Xavier", "Yair", "Zacarías", "Ángel", 
            "Bruno", "César", "Diego", "Erick", "Fabricio", "Gabriel", 
            "Horacio", "Ismael", "Jesús", "Kevin", "Leandro", "Mauro", 
            "Norberto", "Oliver", "Paolo", "Quintín", "Rodrigo", "Sergio", 
            "Tobías", "Urbano", "Valentino", "Walter", "Ximén", "Yuri", 
            "Zebedeo", "Álvaro", "Bartolomé", "Cristóbal", "Domingo", 
            "Esteban", "Fernando", "Gerardo", "Hernán", "Iker", "Jonás", 
            "Kevin", "Lorenzo", "Matías", "Nelson", "Orlando", "Pancho",
            "Alberto", "Bruno", "Carlos", "Daniel", "Erick", "Felipe",
          "Gabriel", "Héctor", "Iván", "Joaquín", "Kevin", "Luis",
          "Marcos", "Nicolás", "Oscar", "Pablo", "Quintín", "Ramón",
          "Sebastián", "Tomás", "Ulises", "Víctor", "Wilfredo", "Xavier",
          "Yair", "Zacarías", "Ángel", "Bernardo", "Cristóbal", "Diego",
          "Eduardo", "Fernando", "Guillermo", "Humberto", "Ignacio",
          "Jorge", "Kurt", "Lucas", "Manuel", "Norberto", "Orlando",
          "Pietro", "Ricardo", "Sergio", "Teodoro", "Ulises", "Víctor",
          "Wilfredo", "Xavier", "Yuri", "Zebedeo", "Álvaro", "Bartolomé",
          "Cristian", "Diego", "Ernesto", "Federico", "Gerardo", "Horacio",
          "Iván", "Jesús", "Kevin", "Leonardo", "Mauricio", "Néstor",
          "Oliver", "Pascual", "Quintín", "Raúl", "Samuel", "Teodoro",
          "Ulises", "Víctor", "Wilfredo", "Xavier", "Yuri", "Zacarías",
          "Ángel", "Bernardo", "Carlos", "David", "Emilio", "Felipe",
          "Gerardo", "Héctor", "Iván", "José", "Kevin", "Luis",
          "Mario", "Norberto", "Orlando", "Pedro", "Raúl", "Samuel"
          ];
          
          // Arreglo con apellidos paternos (100 elementos)
          const apellidosPaternos = [
            "García", "Martínez", "López", "Hernández", "González", "Pérez", 
            "Rodríguez", "Sánchez", "Ramírez", "Flores", "Rivera", "Torres", 
            "Reyes", "Morales", "Cruz", "Ramos", "Rojas", "Fernández", 
            "Ortiz", "Gutiérrez", "Castillo", "Medina", "Vega", "Aguilar", 
            "Santos", "Sandoval", "Delgado", "Mora", "León", "Castro", 
            "Ortega", "Nieto", "Suárez", "Navarro", "Vázquez", "Mendoza", 
            "Lara", "Cervantes", "Varela", "Acosta", "Pacheco", "Campos", 
            "Montes", "Juárez", "Pineda", "Del Campo", "Fuentes", "Corral", 
            "Carvajal", "Esparza", "Benítez", "Bermúdez", "Carrasco", 
            "Briones", "Cárdenas", "Chávez", "Cisneros", "Curiel", 
            "Delgadillo", "Escobar", "Fabián", "Flores", "García", 
            "González", "Hernández", "Islas", "Jiménez", "King", "López", 
            "Marín", "Nava", "Orozco", "Páez", "Quezada", "Ramos", "Silva", 
            "Téllez", "Uribe", "Villalobos", "Yáñez", "Zamora", "Álvarez", 
            "Bernal", "Caballero", "Castellanos", "Durán", "Estrada", 
            "Figueroa", "Garrido", "Herrera", "Iglesias", "Juárez", 
            "Krauss", "León", "Morales", "Nogales", "Osorio", "Paredes",
            "Arévalo", "Bernal", "Cabrera", "Delgado", "Espinosa", "Flores",
          "Gómez", "Hernández", "Iglesias", "Jiménez", "Krauss", "López",
          "Martínez", "Navarro", "Ortega", "Pérez", "Quintana", "Ramírez",
          "Suárez", "Torres", "Uribe", "Villalobos", "Waldemar", "Ximénez",
          "Yáñez", "Zapata", "Ávila", "Barrios", "Cordero", "Durán",
          "Estrada", "Figueroa", "González", "Herrera", "Izquierdo", 
          "Juárez", "Krauss", "León", "Morales", "Nogales", "Ortega",
          "Paredes", "Quiroz", "Ramos", "Silva", "Trujillo", "Urbina",
          "Villarreal", "Winston", "Xochimilco", "Yáñez", "Zamora", 
          "Álvarez", "Bravo", "Carrasco", "Domínguez", "Espinosa",
          "Fuentes", "García", "Hernández", "Islas", "Jiménez", "King",
          "López", "Martínez", "Nava", "Orozco", "Pacheco", "Quezada",
          "Rodríguez", "Silva", "Téllez", "Uribe", "Villanueva", "Winston",
          "Ximénez", "Yáñez", "Zamora", "Ávila", "Benítez", "Cabrera",
          "Delgado", "Espinosa", "Flores", "González", "Hernández", 
          "Izquierdo", "Juárez", "King", "León", "Martínez", "Núñez",
          "Ortega", "Pacheco", "Quintero"
          ];
          
          // Arreglo con apellidos maternos (100 elementos)
          const apellidosMaternos = [
            "Castillo", "Ortega", "Vázquez", "Jiménez", "Ramos", "Ruiz", 
            "Molina", "Serrano", "Blanco", "Moreno", "Suárez", "Nieto", 
            "Pacheco", "Sosa", "Romero", "Álvarez", "Benítez", "Contreras", 
            "Delgado", "Espinoza", "Flores", "García", "Hernández", 
            "Jiménez", "King", "León", "Molina", "Navarro", "Ortiz", 
            "Pérez", "Quintana", "Ramírez", "Suárez", "Torres", 
            "Urbina", "Valencia", "Waldemar", "Ximénez", "Zapata", 
            "Álvarez", "Bravo", "Cervantes", "Domínguez", "Espinosa", 
            "Fuentes", "Garrido", "Hidalgo", "Íñiguez", "Juárez", 
            "Krueger", "López", "Martínez", "Núñez", "Olmos", 
            "Pacheco", "Quiñones", "Ramírez", "Silva", "Téllez", 
            "Uribe", "Valdez", "Wilhelm", "Xochimilco", "Zamora", 
            "Álvarez", "Barragán", "Camarena", "Duarte", "Espinoza", 
            "Fuentes", "García", "Hernández", "Iglesias", "Juárez", 
            "Krauss", "León", "Morales", "Nogales", "Osorio", 
            "Pacheco", "Quezada", "Rodríguez", "Suárez", "Trujillo", 
            "Urquiza", "Villarreal", "Winston", "Ximénez", "Yáñez", 
            "Zaragoza", "Álvarez", "Blanco", "Contreras", "Domínguez",
            "Alarcón", "Benítez", "Contreras", "Durán", "Espinoza", "Flores",
          "Gutiérrez", "Hidalgo", "Íñiguez", "Juárez", "Krauss", 
          "López", "Martínez", "Núñez", "Olmos", "Pacheco", "Quiñones",
          "Ruiz", "Suárez", "Torres", "Urbina", "Valdez", "Wilhelm",
          "Xochimilco", "Yáñez", "Zapata", "Álvarez", "Blanco", 
          "Cervantes", "Domínguez", "Espinosa", "Fuentes", "García",
          "Hernández", "Islas", "Jiménez", "King", "León", "Morales",
          "Nogales", "Osorio", "Pérez", "Quintana", "Rodríguez", "Silva",
          "Trujillo", "Uribe", "Villarreal", "Winston", "Ximénez",
          "Yáñez", "Zaragoza", "Álvarez", "Bravo", "Carrillo", "Delgado",
          "Espinoza", "Flores", "García", "Hernández", "Iglesias",
          "Juárez", "Krauss", "López", "Martínez", "Navarro", "Ortiz",
          "Paredes", "Quintana", "Ramos", "Suárez", "Torres", 
          "Urbina", "Valencia", "Wilhelm", "Xochimilco", "Yáñez",
          "Zapata", "Álvarez", "Benítez", "Cabrera", "Delgado", 
          "Espinosa", "Flores", "García", "Hernández", "Jiménez",
          "King", "López", "Martínez", "Nava", "Orozco", "Pacheco",
          "Quezada", "Ramírez", "Silva", "Téllez", "Uribe"
          ];
        
          const sex = ['male', 'female']
          const femaleImg = {
            public_id : 'up8r5vvuajc0ltbv016j',
            secure_url : 'https://res.cloudinary.com/dltytaqui/image/upload/v1714668114/up8r5vvuajc0ltbv016j.png'
          }
          const maleImg = {
            public_id : 'cgz8grqzzlumeia6wt1j',
            secure_url : 'https://res.cloudinary.com/dltytaqui/image/upload/v1714668117/cgz8grqzzlumeia6wt1j.png'
          }
        
          const codigosPostalesAtlanta = [
            30301, 30302, 30303, 30304, 30305, 30306, 30307, 30308, 30309,
            30310, 30311, 30312, 30313, 30314, 30315, 30316, 30317, 30318,
            30319, 30320, 30321, 30322, 30324, 30325, 30326, 30327, 30328,
            30329, 30330, 30331, 30332, 30333, 30334, 30336, 30337, 30338,
            30339, 30340, 30341, 30342, 30343, 30344, 30345, 30346, 30348,
            30349, 30350, 30353, 30354, 30355, 30357, 30358, 30359, 30360,
            30361, 30362, 30363, 30364, 30366, 30368, 30369, 30370, 30371,
            30374, 30375, 30377, 30378, 30379, 30380, 30384, 30385, 30386,
            30387, 30388, 30390, 30392, 30394, 30396, 30398, 31106, 31107,
            31119, 31126, 31131, 31136, 31139, 31141, 31144, 31145, 31146,
            31150, 31156, 31192, 31193, 31195, 31196, 31197, 31198, 31199
          ];
          
          const callesAtlanta = [
            "Peachtree Street",
            "Marietta Street",
            "Ponce de Leon Avenue",
            "Northside Drive",
            "Moreland Avenue",
            "Cascade Road",
            "Edgewood Avenue",
            "Memorial Drive",
            "Piedmont Road",
            "West Peachtree Street",
            "Pryor Street",
            "Baker Street",
            "Boulevard",
            "Spring Street",
            "Peachtree Industrial Boulevard",
            "Monroe Drive",
            "North Avenue",
            "Andrew Young International Boulevard",
            "Hugh Howell Road",
            "Glenwood Avenue",
            "17th Street NW",
          "10th Street NW",
          "14th Street NW",
          "Piedmont Avenue",
          "Juniper Street",
          "Courtland Street",
          "Fowler Street",
          "Ralph McGill Boulevard",
          "M.L.K. Jr. Drive SW",
          "Hilliard Street SE",
          "DeKalb Avenue",
          "Virginia Avenue",
          "Lenox Road NE",
          "Mount Paran Road NW",
          "Nancy Creek Road NW",
          "West Paces Ferry Road NW",
          "Howell Mill Road NW",
          "Huff Road NW",
          "Marietta Boulevard NW",
          "Joseph E. Boone Boulevard",
          "Flat Shoals Avenue SE",
          "Collier Road NW",
          "Cheshire Bridge Road NE",
          "Emory Drive NE",
          "North Highland Avenue NE",
          "Peachtree Battle Avenue NW",
          "Donald Lee Hollowell Parkway NW",
          "Chamblee Tucker Road",
          "Roswell Road",
          "Cobb Drive SE",
          "East Paces Ferry Road NE",
          "Peyton Road SW",
          "Kimberly Road SW",
          "Greenbriar Parkway SW",
          "Cleveland Avenue SW",
          "Custer Avenue SE",
          "North Decatur Road",
          "Campbellton Road SW",
          "Garnett Street SW",
          "Simpson Road NW"
          ];
        

        // Crear 1,000 usuarios
        for (let i = 64; i <= 1000; i++) {
            const gender = sex[Math.floor(Math.random() * sex.length)];
            const firstName = gender === 'male' ? 
                nombresHombres[Math.floor(Math.random() * nombresHombres.length)] :
                nombresMujeres[Math.floor(Math.random() * nombresMujeres.length)];
            const lastName1 = apellidosPaternos[Math.floor(Math.random() * apellidosPaternos.length)];
            const lastName2 = apellidosMaternos[Math.floor(Math.random() * apellidosMaternos.length)];
            const cellPhone = Math.floor(1000000000 + Math.random() * 9000000000); // 10 dígitos
            const street = callesAtlanta[Math.floor(Math.random() * callesAtlanta.length)];
            const postalCode = codigosPostalesAtlanta[Math.floor(Math.random() * codigosPostalesAtlanta.length)];
            const numCasa = Math.floor(100 + Math.random() * 900); // 3 dígitos

            const userNumber = i.toString().padStart(5, '0'); // '00001'
            const userName = `User#${userNumber}`;
            const email = `user${userNumber}@gmail.com`;
            const password = `User#${userNumber}`;
            const img = gender === 'male' ? maleImg : femaleImg;
            // const data = {
            //     name: firstName,
            //         apellidoP: lastName1,
            //         apellidoM: lastName2,
            //         fechaNacimiento: getRandomBirthdate(),
            //         genero: gender,
            //         telefono :cellPhone,
            //         direccion: {
            //             neighborhood: 'example direction',
            //             casa : numCasa,
            //             postal :postalCode,
            //             calle: street,
            //             ciudad: 'Atlanta',
            //         },
            //         user : userName,
            //         mail : email,
            //         pass :password,
            //         imagen : img,
            // }
            // console.log(data)
            // Enviar solicitud para crear un usuario
            const response = await request(app)
                .post('/api/user/signup')
                .send({
                    name: firstName,
                    apellidoP: lastName1,
                    apellidoM: lastName2,
                    fechaNacimiento: getRandomBirthdate(),
                    genero: gender,
                    cellPhone,
                    direccion: {
                        neighborhood: 'example direction',
                        numCasa,
                        postalCode,
                        calle: street,
                        ciudad: 'Atlanta',
                    },
                    userName,
                    email,
                    password,
                    img,
                });

            expect(response.body.success).toBe(true); // Verificamos el éxito de la operación
        }
        
    }, 120000 );

    // Después de todas las pruebas, cerramos la conexión a MongoDB
    afterAll(async () => {
        await mongoose.connection.close();
    });
});

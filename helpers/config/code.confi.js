export const generateRandomCode = () =>{
    // Genera un número aleatorio entre 100000 y 999999 (ambos inclusive)
    const randomCode = Math.floor(100000 + Math.random() * 900000);
    
    // Convierte el número a una cadena de texto
    return randomCode.toString();
  }
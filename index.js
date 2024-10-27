import app from './app.js'

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Run in port http://localhost:' + PORT));

export default app
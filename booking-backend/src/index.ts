import app from './app';
import { connectDB } from './database/mongodb';

import { PORT } from './config';

//starting the mongodb server
async function startServer() {
    await connectDB();
    app.listen(PORT, '0.0.0.0', () => {  // Bind to all network interfaces so the server is reachable from containers or other hosts during development
        console.log(`Server on http://localhost:${PORT}`);
    });
}

startServer();
import app from './app';
import env from './config/env';
import connectDB from './services/mongoDB';

app.listen(env.PORT, () => {
    connectDB();
    console.log(`Server is running on http://localhost:${env.PORT}`);
});

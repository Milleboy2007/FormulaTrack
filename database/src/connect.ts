import mongoose from 'mongoose';
import 'dotenv/config';

const databaseConnection = async () => {
    const uri = process.env.DATABASE_URL;
    if (!uri) {
        throw new Error(
            'La variable d\'environnement DATABASE_URL est obligatoire.',
        );
    }
    await mongoose.connect(uri);
    return mongoose.connection;
};

export default databaseConnection;
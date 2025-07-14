const mongoose = require('mongoose');

exports.connect = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            dbName: 'shop',
        });
        console.log('✅ MongoDB connected');
    } catch (err) {
        console.error('❌ Mongo error', err);
        process.exit(1);
    }
};

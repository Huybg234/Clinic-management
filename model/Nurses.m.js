const { db } = require('../model/Database.m');
module.exports = {
    getAll: async () => {
        const rs = await db.collection('Nurses').find({}).toArray();
        return rs;
    },
    getByName: async (Name) => {
        const rs = await db.collection('Nurses').find({ Name: Name }).toArray();
        return rs;
    },
    getByID: async (ID) => {
        const rs = await db.collection('Nurses').find({ ID: ID }).toArray();
        return rs;
    },
    getByUsername: async (Username) => {
        const rs = await db.collection('Nurses').find({ Username: Username }).toArray();
        return rs;
    },
    update: async (user, data) => {
        await db.collection('Nurses').updateOne({ Username: user }, { $set: data }, { upsert: true });
    },
    updateSalary: async (salary, data) => {
        await db.collection('Nurses').updateOne({ Salary: salary }, { $set: data }, { upsert: true });
    }
}
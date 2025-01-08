import config from "config";
import mongoose from "mongoose";
export const initdb = async () => {
    await mongoose.connect(config.get("database.url"));
};

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const routes_1 = __importDefault(require("./routes"));
require('dotenv').config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
app.options('*', (0, cors_1.default)());
app.use(routes_1.default);
app.use((0, cors_1.default)({ origin: '*' }));
app.use(express_1.default.json());
// Middleware to parse URL-encoded form data
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.static('dist'));
const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_CLUSTER}.zzpvtsc.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`;
const options = { useNewUrlParser: true, useUnifiedTopology: true };
mongoose_1.default
    .connect(uri)
    .then(() => app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`)))
    .catch((error) => {
    throw error;
});

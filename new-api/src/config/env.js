"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config({ path: '.env' });
const envSchema = zod_1.z.object({
    PORT: zod_1.z.string().transform(Number).pipe(zod_1.z.number().positive()),
    MONGODB_URI: zod_1.z.string().url(),
    JWT_SECRET: zod_1.z.string().min(32),
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    TCDD_AUTH_TOKEN: zod_1.z.string().optional().default('')
});
function validateEnv() {
    const parsed = envSchema.safeParse(process.env);
    if (!parsed.success) {
        console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
        throw new Error('Invalid environment variables');
    }
    return parsed.data;
}
exports.env = validateEnv();

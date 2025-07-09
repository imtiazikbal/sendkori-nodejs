"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app/module/app.module");
const dotenv = require("dotenv");
dotenv.config();
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: [
            'https://payment.cedhan.site',
            'https://sendkori.vercel.app',
            'http://localhost:3002',
        ],
        credentials: true,
    });
    await app.listen(Number(process.env.PORT) || 3001);
}
bootstrap();
//# sourceMappingURL=main.js.map
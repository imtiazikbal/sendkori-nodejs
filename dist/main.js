"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app/module/app.module");
const dotenv = require("dotenv");
dotenv.config();
const path_1 = require("path");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const uploadPath = (0, path_1.resolve)(process.env.UPLOAD_DIR || './uploads');
    app.useStaticAssets(uploadPath, {
        prefix: '/images/',
    });
    app.enableCors({
        origin: [
            'https://payment.cedhan.site',
            'https://sendkori.vercel.app',
            'http://localhost:3001',
            'http://localhost:3002',
            'http://localhost:3000',
        ],
        credentials: true,
    });
    await app.listen(Number(process.env.PORT) || 3001);
}
bootstrap();
//# sourceMappingURL=main.js.map
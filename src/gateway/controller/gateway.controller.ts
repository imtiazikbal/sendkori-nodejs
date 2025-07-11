import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';

const uploadPath = process.env.UPLOAD_DIR || './uploads';

// Ensure directory exists
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}
import { GatewayService } from '../service/gateway.service';
import { CreateGatewayDto } from '../dto/create-gateway.dto';
import { UpdateGatewayDto } from '../dto/update-gateway.dto';

@Controller('gateway')
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: uploadPath,
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateGatewayDto,
  ) {
    return await this.gatewayService.create({
      image: file?.filename,
      status: body?.status,
      title: body?.title,
      paymentMethod: body?.paymentMethod,
      type: body?.type,
    });
  }

  // get all active gateway
  @Get()
  async findAll() {
    return await this.gatewayService.findAll();
  }
}

import { Module } from '@nestjs/common';
import { GatewayService } from '../service/gateway.service';
import { GatewayController } from '../controller/gateway.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Gateway, GatewaySchema } from '../schema/gateway.schema';
import { ResponseService } from 'src/common/error/response/response.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Gateway.name, schema: GatewaySchema }]),
  ],
  controllers: [GatewayController],
  providers: [GatewayService, ResponseService],
  exports: [GatewayService],
})
export class GatewayModule {}

import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateGatewayDto } from '../dto/create-gateway.dto';
import { UpdateGatewayDto } from '../dto/update-gateway.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Gateway } from '../schema/gateway.schema';
import { Model } from 'mongoose';
import { ResponseService } from 'src/common/error/response/response.service';
import * as dotenv from 'dotenv';
dotenv.config();
@Injectable()
export class GatewayService {
  constructor(
    @InjectModel(Gateway.name) private readonly gatewayModel: Model<Gateway>,
    private readonly responseService: ResponseService,
  ) {}
  async create({
    title,
    image,
    status,
    paymentMethod,
    type,
  }: CreateGatewayDto) {
    try {
      await this.gatewayModel.create({
        image: process.env.APP_URL + '/' + 'images/' + image,
        title,
        type,
        paymentMethod,
      });
      return this.responseService.successResponse(
        'Gateway created successfully',
      );
    } catch (error) {
      console.error('Error details:', error);
      return this.responseService.throwError(
        error?.message || 'Something went wrong',
        error?.details || error?.stack || 'Unknown error',
        error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll() {
    try {
      const data = await this.gatewayModel
        .find({
          status: true,
        })
        .exec();
      return this.responseService.successResponse(data, 'Gateways fetched');
    } catch (error) {
      console.error('Error details:', error);
      return this.responseService.throwError(
        error?.message || 'Something went wrong',
        error?.details || error?.stack || 'Unknown error',
        error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

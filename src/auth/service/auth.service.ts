import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateAuthDto } from '../dto/create-auth.dto';
import { ResponseService } from 'src/common/error/response/response.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Auth } from '../schema/auth.schema';
import { ConfigService } from '@nestjs/config';
import {
  IAuthPaymentTran,
  ICreateApi,
  IJwtPayload,
  StatusEnum,
} from 'src/interface/types';
import { JwtService } from '@nestjs/jwt';
import { CustomError } from 'src/common/error/errors';
import { Auth_API_key } from '../schema/auth-api.schema';
import { v4 as uuidv4 } from 'uuid';
import { Auth_Payment_Tran } from '../schema/auth-payment-tran.schema';
import { Auth_Payment_Gateway } from '../schema/auth-payment-gateway';

interface ValidateApiKeyDto {
  apiKey: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly responseService: ResponseService,
    @InjectModel(Auth.name) private readonly authModel: Model<Auth>,
    @InjectModel(Auth_API_key.name)
    private readonly apiKeyModel: Model<Auth_API_key>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    @InjectModel(Auth_Payment_Tran.name)
    private readonly authPaymentTranModel: Model<Auth_Payment_Tran>,
    @InjectModel(Auth_Payment_Gateway.name)
    private readonly authPaymentGatewayModel: Model<Auth_Payment_Gateway>,
  ) {}

  async getUserInfo({ request }: { request: any }) {
    try {
      const user = await this.authModel
        .findOne({ email: request?.user?.email })
        .lean();
      if (!user) {
        throw new CustomError(
          'Unauthorized',
          'UnAuthorized',
          HttpStatus.UNAUTHORIZED,
        );
      }
      console.log({ user });
      return this.responseService.successResponse(user, 'User profile fetched');
    } catch (error: any) {
      return this.responseService.throwError(
        error?.message || 'Something went wrong',
        error?.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async create({
    firstName,
    lastName,
    email,
    picture,
    accessToken,
  }: CreateAuthDto): Promise<string> {
    try {
      let user = await this.authModel.findOne({ email }).lean();

      if (!user) {
        const newUser = await this.authModel.create({
          firstName,
          lastName,
          email,
          picture,
          accessToken,
        });

        user = newUser.toObject();
      }

      if (!user) {
        throw new CustomError(
          'User not found after creation',
          `Could not find or create user with email: ${email}`,
          HttpStatus.NOT_FOUND,
        );
      }

      const token = await this.generateToken({
        email,
        id: user._id.toString(),
      });

      const env = this.configService.get<string>('NODE_ENV');
      const redirectUrl =
        env === 'production'
          ? this.configService.get<string>('FRONTEND_MARCHEN_LIVE_URL')
          : this.configService.get<string>('FRONTEND_DEVELOPMENT_URL');

      const url = `${redirectUrl}?token=${token}&username=${encodeURIComponent(
        `${firstName} ${lastName}`,
      )}&profile=${encodeURIComponent(picture ?? '')}&email=${encodeURIComponent(email)}`;

      return url; // Perform redirect from controller
    } catch (error: any) {
      return this.responseService.throwError(
        error?.message || 'Something went wrong',
        error?.details || error?.stack || 'Unknown error',
        error?.statusCode || HttpStatus.BAD_REQUEST,
      );
    }
  }

  async generateToken({
    id,
    email,
  }: {
    id: string;
    email: string;
  }): Promise<string> {
    const payload: IJwtPayload = {
      sub: id,
      email,
    };

    return this.jwtService.signAsync(payload);
  }

  async checkUserIsActive({
    id,
    email,
  }: {
    id: string;
    email?: string;
  }): Promise<any> {
    try {
      const user = await this.authModel.findOne({ _id: id, email: email });

      if (user && user.active === StatusEnum.INACTIVE) {
        throw new CustomError(
          'User is inactive',
          'User is inactive',
          HttpStatus.UNAUTHORIZED,
        );
      }

      return this.responseService.successResponse(user, 'User profile fetched');
    } catch (e) {
      console.error('Error details:', e); // Log the actual error object
      return this.responseService.throwError(
        e.message || 'Server error',
        e.message,
        e.status,
      );
    }
  }
  // Create and return a unique API key
  async createOrUpdateApiKey({
    request,
    body,
  }: {
    request: any;
    body: ICreateApi;
  }) {
    try {
      const userId = request.user.userId;
      if (!userId) {
        throw new CustomError(
          'UserID not found',
          'UserID not found',
          HttpStatus.UNAUTHORIZED,
        );
      }
      const email = request.user.email;
      await this.checkUserIsActive({ id: userId, email });
      const apiKey = await this.generateUniqueKey();
      console.log({ apiKey });
      await this.apiKeyModel.create({
        name: body?.name,
        key: apiKey,
        userId: userId,
        isActive: true,
      });
      return this.responseService.successResponse(
        apiKey,
        'API key created successfully',
      );
    } catch (error) {
      return this.responseService.throwError(
        error?.message || 'Something went wrong',
        error?.details || error?.stack || 'Unknown error',
        error?.statusCode || HttpStatus.BAD_REQUEST,
      );
    }
  }

  //  Validate if API key exists
  async validateApiKey({ apiKey }: ValidateApiKeyDto): Promise<boolean> {
    return !!(await this.apiKeyModel.findOne({ key: apiKey }).lean());
  }

  //  Get all API keys for a user (safe to expose)
  async getUserAllApiKeys({ request }: { request: any }) {
    const userId = request.user.userId;
    if (!userId) {
      throw new CustomError(
        'UserID not found',
        'UserID not found',
        HttpStatus.UNAUTHORIZED,
      );
    }
    const email = request.user.email;
    await this.checkUserIsActive({ id: userId, email });
    const keys = await this.apiKeyModel.find({ userId }).lean();
    console.log({ keys });

    const res = keys.map((key) => ({
      id: key?._id,
      keyName: key?.name,
      keyValue: key?.key,
      createdAt: key['createdAt'],
    }));
    return this.responseService.successResponse(res, 'API keys fetched');
  }

  //  Delete API key by ID (with ownership check)
  async deleteApiKey(userId: string, id: string) {
    const apiKey = await this.apiKeyModel.findOne({ _id: id, userId }).lean();

    if (!apiKey) {
      throw new CustomError(
        'API key not found or does not belong to user.',
        'Could not find API key',
        HttpStatus.NOT_FOUND,
      );
    }

    return await this.apiKeyModel.deleteOne({ _id: id, userId });
  }

  //  Lookup user ID using an API key
  async getUserIdByApiKey({ apiKey }: { apiKey: string }): Promise<string> {
    const found = await this.apiKeyModel.findOne({ key: apiKey }).lean();

    if (!found) {
      throw new CustomError(
        'API key not found',
        'Could not find API key',
        HttpStatus.NOT_FOUND,
      );
    }

    return found?.userId;
  }

  //  Utility: Generate a unique, formatted API key
  private async generateUniqueKey(): Promise<string> {
    const randomChars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    const getRandomString = (length: number): string =>
      Array.from({ length })
        .map(() =>
          randomChars.charAt(Math.floor(Math.random() * randomChars.length)),
        )
        .join('');

    const baseKey = getRandomString(48) + uuidv4().replace(/-/g, '');
    const formattedKey = [
      baseKey.slice(0, 10),
      baseKey.slice(10, 20),
      baseKey.slice(20, 30),
      baseKey.slice(30, 40),
      baseKey.slice(40),
    ].join('-');
    return `bondhupay-${formattedKey}`;
  }

  async checkUserIsActiveWithUserId({ id }: { id: string }): Promise<any> {
    try {
      const user = await this.authModel.findOne({ _id: id });
      if (!user) {
        throw new CustomError(
          'Unauthorized',
          'UnAuthorized',
          HttpStatus.UNAUTHORIZED,
        );
      }
      if (user?.active === StatusEnum.INACTIVE) {
        throw new CustomError(
          'User is inactive',
          'User is inactive',
          HttpStatus.UNAUTHORIZED,
        );
      }
      return user;
    } catch (e) {
      console.error('Error details:', e); // Log the actual error object
      return this.responseService.throwError(
        e?.message || 'Server error',
        e?.details,
        e?.statusCode,
      );
    }
  }

  // store auth payment transaction
  async storeAuthPaymentTran({
    fullMessage,
    incomingTime,
    key,
    senderNumber,
    amount,
    fromNumber,
    trxId,
  }: IAuthPaymentTran) {
    try {
      const userId = await this.getUserIdByApiKey({ apiKey: key });
      await this.checkUserIsActiveWithUserId({ id: userId });
      await this.authPaymentTranModel.create({
        key,
        senderNumber,
        incomingTime,
        fullMessage,
        trxId,
        fromNumber,
        amount,
        userId,
      });
      return this.responseService.successResponse(
        'Payment transaction stored successfully',
        'Payment transaction stored successfully',
      );
    } catch (error) {
      console.error('Error details:', error);
      return this.responseService.throwError(
        error?.message || 'Something went wrong',
        error?.details || error?.stack || 'Unknown error',
        error?.statusCode || HttpStatus.BAD_REQUEST,
      );
    }
  }

  // find auth payment trand by user id
  async findAuthPaymentTranByUserId({ userId }: { userId: string }) {
    try {
      const data = await this.authPaymentTranModel
        .find(
          { userId: userId },
          {
            validated: false,
          },
        )
        .lean();
      return data;
    } catch (error) {
      console.error('Error details:', error);
      return this.responseService.throwError(
        error?.message || 'Something went wrong',
        error?.details || error?.stack || 'Unknown error',
        error?.statusCode || HttpStatus.BAD_REQUEST,
      );
    }
  }

  // auth payment tran validated by tranId
  async authPaymentTranValidatedByTranId({ tranId }: { tranId: string }) {
    try {
      const data = await this.authPaymentTranModel
        .findOneAndUpdate(
          { trxId: tranId },
          {
            validated: true,
          },
        )
        .lean();
      return data;
    } catch (error) {
      console.error('Error details:', error);
      throw new CustomError(
        error?.message || 'Something went wrong',
        error?.details || error?.stack || 'Unknown error',
        error?.statusCode || HttpStatus.BAD_REQUEST,
      );
    }
  }

  // auth payment gateway store
  async authPaymentGateway({
    request,
    gatewayId,
    number,
  }: {
    request: any;
    gatewayId: string;
    number: string;
  }) {
    try {
      const userId = request.user.userId;
      const user = await this.checkUserIsActiveWithUserId({ id: userId });

      // const gateway = await this.authPaymentGatewayModel.findOne({
      //   _id: gatewayId,
      // });
      // if (!gateway) {
      //   throw new CustomError(
      //     'Gateway not found',
      //     'Gateway not found',
      //     HttpStatus.NOT_FOUND,
      //   );
      // }
      const data = await this.authPaymentGatewayModel.create({
        gatewayId,
        userId,
        status: true,
        number: number,
      });
      return this.responseService.successResponse(
        data,
        'Payment gateway created successfully',
      );
    } catch (error) {
      console.error('Error details:', error);
      return this.responseService.throwError(
        error?.message || 'Something went wrong',
        error?.details || error?.stack || 'Unknown error',
        error?.statusCode || HttpStatus.BAD_REQUEST,
      );
    }
  }

  // get auth payment gateway by user id
  async getAuthPaymentGatewayByUserId({ userId }: { userId: string }) {
    try {
      const data = await this.authPaymentGatewayModel
        .find({ userId, status: true })
        .populate('gatewayId')
        .exec();
      const modifiedMethod = data.map((item) => {
        return {
          id: item?._id,
          name: item?.gatewayId?.['title'],
          type: item?.gatewayId?.['type'],
          provider: item?.gatewayId?.['paymentMethod'],
          number: item?.number,
          image: item?.gatewayId?.['image'],
          status: item?.status,
          gatewayId: item?.gatewayId,
        };
      });
      return modifiedMethod;
    } catch (error) {
      console.error('Error details:', error);
      throw new CustomError(
        error?.message || 'Something went wrong',
        error?.details || error?.stack || 'Unknown error',
        error?.statusCode || HttpStatus.BAD_REQUEST,
      );
    }
  }

  // authPaymentGatewayList
  async authPaymentGatewayList({ request }: { request: any }) {
    try {
      const userId = request.user.userId;
      await this.checkUserIsActiveWithUserId({ id: userId });
      const data = await this.getAuthPaymentGatewayByUserId({ userId });
      const modifiedMethod = data.map((item) => {
        return {
          id: item?.id,
          name: item?.name,
          type: item?.type,
          provider: item?.provider,
          number: item?.number,
          image: item?.image,
          status: item?.status,
          gatewayId: item?.gatewayId?.['_id'],
        };
      });
      return this.responseService.successResponse(
        modifiedMethod,
        'Auth ActivemPayment gateway list',
      );
    } catch (error) {
      console.error('Error details:', error);
      throw new CustomError(
        error?.message || 'Something went wrong',
        error?.details || error?.stack || 'Unknown error',
        error?.statusCode || HttpStatus.BAD_REQUEST,
      );
    }
  }
}

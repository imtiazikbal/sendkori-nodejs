import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateAuthDto } from '../dto/create-auth.dto';
import { ResponseService } from 'src/common/error/response/response.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Auth } from '../schema/auth.schema';
import { ConfigService } from '@nestjs/config';
import { ICreateApi, IJwtPayload, StatusEnum } from 'src/interface/types';
import { JwtService } from '@nestjs/jwt';
import { CustomError } from 'src/common/error/errors';
import { Auth_API_key } from '../schema/auth-api.schema';
import { v4 as uuidv4 } from 'uuid';

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
  ) {}

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
          ? this.configService.get<string>('FRONTEND_PRODUCTION_URL')
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
        'API key created successfully',
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
  async getUserAllApiKeys(userId: string) {
    const keys = await this.apiKeyModel.find({ userId }).lean();

    return keys.map((key) => ({
      id: key?._id,
      keyName: key?.name,
      keyValue: key?.key,
      createdAt: key['createdAt'],
    }));
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
}

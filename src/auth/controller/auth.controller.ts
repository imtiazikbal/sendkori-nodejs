import {
  Controller,
  Get,
  Req,
  Res,
  UseGuards,
  Logger,
  Post,
  Body,
  Param,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../service/auth.service';
import { Request, Response } from 'express';
import { ICreateApi } from 'src/interface/types';

interface GoogleUser {
  firstName: string;
  lastName: string;
  email: string;
  picture?: string;
  accessToken: string;
}

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  // Auth Info
  @Get('info')
  @UseGuards(AuthGuard('jwt'))
  async info(@Req() req: Request) {
    return this.authService.getUserInfo({ request: req });
  }

  // Initiate Google OAuth2 login
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // This route is just a redirect to Google's OAuth2 consent page,
    // so no need to implement anything here
  }

  // Handle Google OAuth2 callback and redirect with JWT token
  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    try {
      const user = req.user as GoogleUser;

      if (!user) {
        this.logger.warn('No user found in Google OAuth callback');
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Call service to create or find user, then generate redirect URL with token
      const redirectUrl = await this.authService.create({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        picture: user.picture || '',
        accessToken: user.accessToken,
      });

      // Redirect user to frontend with token & profile info
      return res.redirect(redirectUrl);
    } catch (error) {
      this.logger.error('Error in googleAuthRedirect', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  // api key generate
  @Post('generate-api-key')
  @UseGuards(AuthGuard('jwt'))
  async generateApiKey(@Body() body: ICreateApi, @Req() req: Request) {
    return;
  }
  //  get all api keys
  @Get('/api-keys')
  @UseGuards(AuthGuard('jwt'))
  async getAllApiKeys(@Req() req: Request) {
    return this.authService.getUserAllApiKeys({ request: req });
  }

  // auth payment gateway store
  @Post('/auth-payment-gateway')
  @UseGuards(AuthGuard('jwt'))
  async authPaymentGateway(
    @Req() req: Request,
    @Body() { number, gatewayId }: { number: string; gatewayId: string },
  ) {
    return this.authService.authPaymentGateway({
      request: req,
      gatewayId,
      number,
    });
  }

  // auth paymentGateway list
  @Get('/auth-payment-gateway')
  @UseGuards(AuthGuard('jwt'))
  async getAuthPaymentGatewayByUserId(@Req() req: Request) {
    return this.authService.authPaymentGatewayList({
      request: req,
    });
  }
}

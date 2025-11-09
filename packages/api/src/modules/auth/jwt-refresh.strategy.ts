import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '@rewards-bolivia/shared-types';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh', // This name is crucial
) {
  constructor(private readonly configService: ConfigService) {
    const secret = configService.get<string>('JWT_REFRESH_SECRET');
    if (!secret) {
      throw new Error('JWT_REFRESH_SECRET environment variable is not set.');
    }
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.refresh_token;
        },
      ]),
      secretOrKey: secret,
      passReqToCallback: true, // Pass the request object to the validate method
    });
  }

  validate(req: Request, payload: JwtPayload) {
    const refreshToken = req.cookies?.refresh_token;
    return { ...payload, refreshToken };
  }
}

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'HARDCODED_SECRET_REPLACE_WITH_ENV_VAR', // TODO: Move to .env
    });
  }

  async validate(payload: any) {
    // The payload is the decoded JWT, we can add more validation here
    return { userId: payload.sub, email: payload.email };
  }
}

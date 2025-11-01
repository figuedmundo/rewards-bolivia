import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtService } from '@nestjs/jwt';
import { hashPassword, comparePassword } from './auth/password.utils';
import { RegisterUserDto } from './auth/dto/register-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(email);
    if (user && user.passwordHash && (await comparePassword(pass, user.passwordHash))) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      accessToken: this.jwtService.sign(payload),
      // TODO: Implement refresh token generation and storage
      refreshToken: 'HARDCODED_REFRESH_TOKEN',
    };
  }

  async register(registerUserDto: RegisterUserDto) {
    const existingUser = await this.usersService.findOne(registerUserDto.email);
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await hashPassword(registerUserDto.password);
    const newUser = await this.usersService.create({
      email: registerUserDto.email,
      passwordHash: hashedPassword,
    });

    // Exclude password from the returned user object
    const { passwordHash, ...result } = newUser;
    return result;
  }

  async validateOAuthLogin(
    email: string,
    firstName: string,
    lastName: string,
    provider: string,
    providerId: string,
  ): Promise<any> {
    try {
      let user = await this.usersService.findOne(email);

      if (!user) {
        // If user does not exist, create a new one
        user = await this.usersService.create({
          email,
          name: `${firstName} ${lastName}`,
          provider,
          providerId,
          // passwordHash is optional for OAuth users
        });
      } else if (user.provider !== provider || user.providerId !== providerId) {
        // If user exists but with a different provider or providerId,
        // it means they might have registered locally and are now trying to use OAuth.
        // Or they are trying to use a different OAuth provider.
        // We can link the accounts here or throw an error.
        // For simplicity, let's just update the provider info if it's a local user
        // trying to login with OAuth for the first time.
        if (user.provider === 'local' && !user.providerId) {
          user = await this.usersService.update(user.id, {
            provider,
            providerId,
          });
        } else {
          // Account already exists with a different provider
          throw new UnauthorizedException(
            `Account already exists with ${user.provider} provider.`,
          );
        }
      }

      return user;
    } catch (error) {
      throw new UnauthorizedException('OAuth login failed.', error.message);
    }
  }
}


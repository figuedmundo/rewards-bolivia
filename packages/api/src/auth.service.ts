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
    if (user && (await comparePassword(pass, user.passwordHash))) {
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
}


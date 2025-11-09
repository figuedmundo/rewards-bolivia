export interface User {
  id: string;
  email: string;
  role: string;
}

export * from './dto/register-user.dto';
export * from './dto/earn-points.dto';
export * from './dto/redeem-points.dto';
export * from './dto/login.dto';
export * from './dto/user.dto';

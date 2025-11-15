import request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    app.use(cookieParser());
    await app.init();
  });

  const user = {
    email: 'test-user@example.com',
    password: 'password123',
  };

  it('should register a new user /auth/register (POST)', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send(user)
      .expect(201);
  });

  it('should login the user and return tokens /auth/login (POST)', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(user)
      .expect(200);

    expect(response.body).toHaveProperty('accessToken');
    expect(response.headers['set-cookie']).toBeDefined();
  });

  it('should refresh the access token using the refresh token cookie /auth/refresh (POST)', async () => {
    // First, login to get the refresh token cookie
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send(user)
      .expect(200);

    const refreshTokenCookie = loginResponse.headers['set-cookie'][0];

    // Then, use the cookie to refresh the token
    const refreshResponse = await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Cookie', refreshTokenCookie)
      .expect(200);

    expect(refreshResponse.body).toHaveProperty('accessToken');
    expect(refreshResponse.headers['set-cookie']).toBeDefined();
  });

  afterAll(async () => {
    await app.close();
  });
});

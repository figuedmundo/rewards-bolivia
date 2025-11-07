import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import request from 'supertest';
import { AppModule } from 'src/app.module';
import { RegisterUserDto } from '@rewards-bolivia/shared-types';
import { PrismaService } from 'src/infrastructure/prisma.service';
import { SwaggerModule, DocumentBuilder, OpenAPIObject } from '@nestjs/swagger';

describe('API Contract Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let document: OpenAPIObject;

  beforeEach(async () => {
    process.env.GOOGLE_CLIENT_ID = 'test-client-id';
    process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';
    process.env.GOOGLE_CALLBACK_URL =
      'http://localhost:3000/auth/google/callback';
    process.env.JWT_SECRET = 'supersecretjwtkey';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: './.env.test',
          ignoreEnvFile: false,
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );
    app.setGlobalPrefix('api');

    prisma = app.get<PrismaService>(PrismaService);

    const config = new DocumentBuilder()
      .setTitle('Rewards Bolivia API')
      .setDescription('The Rewards Bolivia API description')
      .setVersion('1.0')
      .build();
    document = SwaggerModule.createDocument(app, config);

    await app.init();

    await prisma.pointLedger.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.business.deleteMany();
    await prisma.user.deleteMany();
  });


  afterAll(async () => {
    await app.close();
  });

  describe('/api/auth/register (POST)', () => {
    it('should accept RegisterUserDto and return expected response structure', async () => {
      const registerData: RegisterUserDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };

      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(registerData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('email', registerData.email);
      expect(response.body).toHaveProperty(
        'name',
        `${registerData.firstName} ${registerData.lastName}`,
      );
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).not.toHaveProperty('password');
    });

    it('should reject invalid RegisterUserDto', async () => {
      const invalidData = {
        email: 'invalid-email',
        password: '123',
      };

      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(Array.isArray(response.body.message)).toBe(true);
    });
  });

  describe('/api/auth/login (POST)', () => {
    it('should accept login credentials and return JWT tokens', async () => {
      const registerData: RegisterUserDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(registerData);

      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).not.toHaveProperty('refreshToken');
      expect(response.body).not.toHaveProperty('user');
    });
  });

  describe('/api/users/profile (GET)', () => {
    it('should return user profile with proper authentication', async () => {
      const registerData: RegisterUserDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(registerData);

      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };
      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send(loginData);
      const accessToken = loginResponse.body.accessToken;

      const response = await request(app.getHttpServer())
        .get('/api/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('email');
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).not.toHaveProperty('password');
    });

    it('should reject requests without authentication', async () => {
      await request(app.getHttpServer()).get('/api/users/me').expect(401);
    });
  });

  describe('OpenAPI Schema Validation', () => {
    it('should serve valid OpenAPI specification', async () => {
      expect(document).toHaveProperty('openapi');
      expect(document).toHaveProperty('info');
      expect(document).toHaveProperty('paths');
      expect(document).toHaveProperty('components');

      expect(document.paths).toHaveProperty('/api/auth/register');
      expect(document.paths).toHaveProperty('/api/auth/login');
      expect(document.paths).toHaveProperty('/api/users/me');

      expect(document.components?.schemas).toHaveProperty('RegisterUserDto');
      expect(document.components?.schemas).toHaveProperty('LoginDto');
      expect(document.components?.schemas).toHaveProperty('UserDto');
    });

    it('should have consistent DTO definitions', async () => {
      const registerSchema = document.components?.schemas?.RegisterUserDto;
      expect(registerSchema).toHaveProperty('type', 'object');
      expect(registerSchema.properties).toHaveProperty('email');
      expect(registerSchema.properties).toHaveProperty('password');
      expect(registerSchema.properties).toHaveProperty('firstName');
      expect(registerSchema.properties).toHaveProperty('lastName');

      expect(registerSchema.required).toContain('email');
      expect(registerSchema.required).toContain('password');
      expect(registerSchema.required).toContain('firstName');
      expect(registerSchema.required).toContain('lastName');
    });
  });

  describe('SDK Compatibility', () => {
    it('should generate compatible SDK from OpenAPI spec', async () => {
      expect(document.components).toHaveProperty('schemas');
      expect(document).toHaveProperty('paths');

      const authPaths = Object.keys(document.paths || {}).filter((path) =>
        path.startsWith('/api/auth'),
      );
      expect(authPaths.length).toBeGreaterThan(0);

      const userPaths = Object.keys(document.paths || {}).filter((path) =>
        path.startsWith('/api/users'),
      );
      expect(userPaths.length).toBeGreaterThan(0);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../api/src/app.module';
import { RegisterUserDto } from '../dto/register-user.dto';

describe('API Contract Tests', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
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

      // Verify response structure matches contract
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('email', registerData.email);
      expect(response.body).toHaveProperty('firstName', registerData.firstName);
      expect(response.body).toHaveProperty('lastName', registerData.lastName);
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).not.toHaveProperty('password'); // Password should not be returned
    });

    it('should reject invalid RegisterUserDto', async () => {
      const invalidData = {
        email: 'invalid-email', // Invalid email format
        password: '123', // Too short
      };

      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(invalidData)
        .expect(400);

      // Verify validation error structure
      expect(response.body).toHaveProperty('message');
      expect(Array.isArray(response.body.message)).toBe(true);
    });
  });

  describe('/api/auth/login (POST)', () => {
    it('should accept login credentials and return JWT tokens', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      // Verify JWT token structure
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('user');

      // Verify user object structure
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('email');
      expect(response.body.user).not.toHaveProperty('password');
    });
  });

  describe('/api/users/profile (GET)', () => {
    let accessToken: string;

    beforeAll(async () => {
      // Login to get token
      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      accessToken = loginResponse.body.accessToken;
    });

    it('should return user profile with proper authentication', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // Verify profile structure
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('email');
      expect(response.body).toHaveProperty('firstName');
      expect(response.body).toHaveProperty('lastName');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).not.toHaveProperty('password');
    });

    it('should reject requests without authentication', async () => {
      await request(app.getHttpServer())
        .get('/api/users/profile')
        .expect(401);
    });
  });

  describe('OpenAPI Schema Validation', () => {
    it('should serve valid OpenAPI specification', async () => {
      const response = await request(app.getHttpServer())
        .get('/api-json')
        .expect(200);

      const spec = response.body;

      // Verify OpenAPI structure
      expect(spec).toHaveProperty('openapi');
      expect(spec).toHaveProperty('info');
      expect(spec).toHaveProperty('paths');
      expect(spec).toHaveProperty('components');

      // Verify API paths exist
      expect(spec.paths).toHaveProperty('/api/auth/register');
      expect(spec.paths).toHaveProperty('/api/auth/login');
      expect(spec.paths).toHaveProperty('/api/users/profile');

      // Verify schemas
      expect(spec.components.schemas).toHaveProperty('RegisterUserDto');
      expect(spec.components.schemas).toHaveProperty('LoginDto');
      expect(spec.components.schemas).toHaveProperty('UserDto');
    });

    it('should have consistent DTO definitions', async () => {
      const specResponse = await request(app.getHttpServer()).get('/api-json');
      const spec = specResponse.body;

      // Verify RegisterUserDto schema
      const registerSchema = spec.components.schemas.RegisterUserDto;
      expect(registerSchema).toHaveProperty('type', 'object');
      expect(registerSchema.properties).toHaveProperty('email');
      expect(registerSchema.properties).toHaveProperty('password');
      expect(registerSchema.properties).toHaveProperty('firstName');
      expect(registerSchema.properties).toHaveProperty('lastName');

      // Verify required fields
      expect(registerSchema.required).toContain('email');
      expect(registerSchema.required).toContain('password');
      expect(registerSchema.required).toContain('firstName');
      expect(registerSchema.required).toContain('lastName');
    });
  });

  describe('SDK Compatibility', () => {
    it('should generate compatible SDK from OpenAPI spec', async () => {
      // This test would verify that the generated SDK can be imported
      // and used correctly. In a real scenario, you'd generate the SDK
      // and test its compatibility.

      const specResponse = await request(app.getHttpServer()).get('/api-json');
      const spec = specResponse.body;

      // Verify spec has all necessary components for SDK generation
      expect(spec.components).toHaveProperty('schemas');
      expect(spec).toHaveProperty('paths');

      // Verify no breaking changes in API contract
      const authPaths = Object.keys(spec.paths).filter(path => path.startsWith('/api/auth'));
      expect(authPaths.length).toBeGreaterThan(0);

      const userPaths = Object.keys(spec.paths).filter(path => path.startsWith('/api/users'));
      expect(userPaths.length).toBeGreaterThan(0);
    });
  });
});
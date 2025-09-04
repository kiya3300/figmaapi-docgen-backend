import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('test-token'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should return access token and user info', async () => {
      const user = { id: '1', email: 'test@example.com' };
      const result = await service.login(user);

      expect(result).toEqual({
        access_token: 'test-token',
        user: {
          id: '1',
          email: 'test@example.com',
        },
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        email: 'test@example.com',
        sub: '1',
      });
    });
  });
}); 
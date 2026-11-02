import HttpRepository from '@/packages/shared/repositories/http';
import type TokenService from '@/packages/shared/services/token';

class ApiRepository {
  public http: HttpRepository;

  public tokenService: TokenService;

  constructor(baseUrl: string, tokenService: TokenService) {
    this.http = new HttpRepository(baseUrl);
    this.tokenService = tokenService;

    // Request interceptors go here
  }
}

export default ApiRepository;

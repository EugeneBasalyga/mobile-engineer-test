import { STORAGE_KEYS } from '@/packages/shared/constants/storage';
import type StorageRepository from '@/packages/shared/repositories/storage';

class TokenService {
  public storageRepository: StorageRepository;

  constructor(storageRepository: StorageRepository) {
    this.storageRepository = storageRepository;

    this.getAccessToken = this.getAccessToken.bind(this);
    this.setAccessToken = this.setAccessToken.bind(this);
    this.removeAccessToken = this.removeAccessToken.bind(this);

    this.getRefreshToken = this.getRefreshToken.bind(this);
    this.setRefreshToken = this.setRefreshToken.bind(this);
    this.removeRefreshToken = this.removeRefreshToken.bind(this);
  }

  getAccessToken() {
    const accessToken = this.storageRepository.getItem(STORAGE_KEYS.ACCESS_TOKEN) || '';
    return accessToken;
  }

  setAccessToken(accessToken: string) {
    this.storageRepository.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
  }

  removeAccessToken() {
    this.storageRepository.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  getRefreshToken() {
    const refreshToken = this.storageRepository.getItem(STORAGE_KEYS.REFRESH_TOKEN) || '';
    return refreshToken;
  }

  setRefreshToken(refreshToken: string) {
    this.storageRepository.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  }

  removeRefreshToken() {
    this.storageRepository.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  }
}

export default TokenService;

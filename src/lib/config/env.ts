interface EnvConfig {
  API_BASE_URL: string;
  API_TIMEOUT: number;
  NODE_ENV: string;
}

class EnvironmentMapper {
  private static instance: EnvironmentMapper;
  private config: EnvConfig;

  private constructor() {
    this.config = {
      API_BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3030',
      API_TIMEOUT: Number(import.meta.env.VITE_API_TIMEOUT) || 10000,
      NODE_ENV: import.meta.env.MODE || 'development'
    };
  }

  public static getInstance(): EnvironmentMapper {
    if (!EnvironmentMapper.instance) {
      EnvironmentMapper.instance = new EnvironmentMapper();
    }
    return EnvironmentMapper.instance;
  }

  public get<K extends keyof EnvConfig>(key: K): EnvConfig[K] {
    return this.config[key];
  }

  public getAll(): EnvConfig {
    return { ...this.config };
  }

  public isDevelopment(): boolean {
    return this.config.NODE_ENV === 'development';
  }

  public isProduction(): boolean {
    return this.config.NODE_ENV === 'production';
  }
}

const envConfig = EnvironmentMapper.getInstance();
console.log('Environment Configuration:', envConfig.getAll());
export { envConfig };
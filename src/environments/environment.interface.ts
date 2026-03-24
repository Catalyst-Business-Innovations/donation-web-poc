import { AppEnvironment } from 'src/app/shared/models/enums';

export interface AppEnvironmentConfig {
  id: AppEnvironment;
  production: boolean;
  domainName: string;
  donationApiUrl: string;
  companyApiUrl: string;
  companyUrl: string;
  tpmUrl: string;
  listerUrl: string;
  posUrl: string;
  posApiUrl: string;
  imsUrl: string;
  imsApiUrl: string;
  environmentName: string;
}

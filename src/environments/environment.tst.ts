import { AppEnvironment } from 'src/app/shared/models/enums';

const domainName = 'dev.rcscbs.com';

export const environment = {
  id: AppEnvironment.Development,
  production: false,
  domainName,
  donationApiUrl: `https://donation-api.${domainName}/api`,
  companyApiUrl: `https://company-api.${domainName}/api`,
  companyUrl: `https://company.${domainName}`,
  tpmUrl: `https://productionsystem.${domainName}`,
  listerUrl: `https://lister.${domainName}`,
  posUrl: `https://pos.${domainName}`,
  posApiUrl: `https://pos-api.${domainName}/api/`,
  imsUrl: `https://inventory.${domainName}`,
  imsApiUrl: `https://inventory-api.${domainName}/api`,
  environmentName: 'dev'
};

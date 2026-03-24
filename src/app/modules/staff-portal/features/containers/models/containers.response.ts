import { ContainerType, ContainerStatus, ContainerDest, ContainerContent } from '@core/models/domain.models';

export interface ContainerResponse {
  id: number;
  referenceNumber: string;
  barcode: string;
  donationId?: number;
  donationReceiptNumber?: string;
  donorVisitLabel?: string;
  presortWorkerName?: string;
  containerType: ContainerType;
  contents: ContainerContent[];
  destination?: ContainerDest;
  status: ContainerStatus;
  deptKey?: string;
  deptName?: string;
  catKey?: string;
  catName?: string;
  locationId: number;
  locationName: string;
  createdAt: Date;
  updatedAt: Date;
  presortedAt?: Date;
  totalItems: number;
  totalEstimatedValue: number;
  salvageWeightLbs?: number;
  notes?: string;
  closedAt?: Date;
  transferToLocationId?: number;
  transferToLocationName?: string;
  mergedContainerIds?: number[];
}

export interface DepartmentResponse {
  key: string;
  name: string;
  categories: CategoryResponse[];
}

export interface CategoryResponse {
  key: string;
  name: string;
}

export interface LocationResponse {
  id: number;
  name: string;
}

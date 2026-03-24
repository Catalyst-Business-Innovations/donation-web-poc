import { ContainerType, ContainerStatus, ContainerDest, ContainerContent } from '@core/models/domain.models';

export interface CreateContainerRequest {
  containerType: ContainerType;
  status: ContainerStatus;
  deptKey: string;
  deptName: string;
  catKey?: string;
  catName?: string;
  destination?: ContainerDest;
  transferToLocationId?: number;
  transferToLocationName?: string;
  salvageWeightLbs?: number;
  notes?: string;
}

export interface UpdateContainerRequest {
  status: ContainerStatus;
  destination?: ContainerDest;
  transferToLocationId?: number;
  transferToLocationName?: string;
  notes?: string;
  presortedAt?: Date;
  closedAt?: Date;
}

export interface MergeContainersRequest {
  sourceIds: number[];
  containerType: ContainerType;
  deptKey: string;
  deptName: string;
  catKey?: string;
  catName?: string;
  destination?: ContainerDest;
  transferToLocationId?: number;
  transferToLocationName?: string;
  notes?: string;
  mergedContents: ContainerContent[];
  totalItems: number;
}

export interface BulkStatusRequest {
  containerIds: number[];
  status: ContainerStatus;
}

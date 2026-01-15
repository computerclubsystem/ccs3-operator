import { DeviceGroup } from './device-group';

export interface DeviceGroupData {
  deviceGroup: DeviceGroup;
  assignedDeviceIds: number[];
  assignedTariffIds: number[];
}

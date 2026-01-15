import { NotificationMessage } from '../index-declarations';
import { DeviceConnectivityItem } from '../index-entities';

export interface OperatorDeviceConnectivitiesNotificationMessageBody {
  connectivityItems: DeviceConnectivityItem[];
}

export type OperatorDeviceConnectivitiesNotificationMessage = NotificationMessage<OperatorDeviceConnectivitiesNotificationMessageBody>;

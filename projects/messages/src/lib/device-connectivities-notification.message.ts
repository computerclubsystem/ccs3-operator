import { NotificationMessage } from '@ccs3-operator/messages';
import { DeviceConnectivityItem } from './entities/device-connectivity-item';

export interface OperatorDeviceConnectivitiesNotificationMessageBody {
  connectivityItems: DeviceConnectivityItem[];
}

export interface OperatorDeviceConnectivitiesNotificationMessage extends NotificationMessage<OperatorDeviceConnectivitiesNotificationMessageBody> {
}

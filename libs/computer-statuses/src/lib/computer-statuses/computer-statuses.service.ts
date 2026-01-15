import { Injectable } from '@angular/core';

import { GetDeviceConnectivityDetailsReplyMessageBody } from '@ccs3-operator/messages';
import { DeviceConnectivityDetails } from './internals';

@Injectable({
  providedIn: 'root'
})
export class ComputerStatusesService {
  createDeviceConnectivityDetailsItem(replyMsgBody: GetDeviceConnectivityDetailsReplyMessageBody): DeviceConnectivityDetails {
    const connectivityDetails: DeviceConnectivityDetails = {
      connectionEventItems: replyMsgBody.connectionEventItems,
      connectionsCount: replyMsgBody.connectionsCount,
      deviceId: replyMsgBody.deviceId,
      isConnected: replyMsgBody.isConnected,
      receivedMessagesCount: replyMsgBody.receivedMessagesCount,
      secondsSinceLastConnection: replyMsgBody.secondsSinceLastConnection,
      sentMessagesCount: replyMsgBody.sentMessagesCount,
      secondsSinceLastReceivedMessage: replyMsgBody.secondsSinceLastReceivedMessage,
      secondsSinceLastSentMessage: replyMsgBody.secondsSinceLastSentMessage,
    };
    return connectivityDetails;
  }
}

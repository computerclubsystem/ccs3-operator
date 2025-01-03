import { Injectable } from '@angular/core';

import { MessageType } from '@ccs3-operator/messages'

@Injectable({ providedIn: 'root' })
export class RequestReplyTypeService {
  private map = this.createRequestReplyMap();

  getReplyType(requestType: MessageType): MessageType | undefined {
    return this.map.get(requestType);
  }

  private createRequestReplyMap(): Map<MessageType, MessageType> {
    const map = new Map<MessageType, MessageType>();
    map.set(MessageType.authRequest, MessageType.authReply);
    map.set(MessageType.refreshTokenRequest, MessageType.refreshTokenReply);
    map.set(MessageType.signOutRequest, MessageType.signOutReply);
    map.set(MessageType.getAllDevicesRequest, MessageType.getAllDevicesReply);
    map.set(MessageType.getDeviceByIdRequest, MessageType.getDeviceByIdReply);
    map.set(MessageType.updateDeviceRequest, MessageType.updateDeviceReply);
    map.set(MessageType.getAllTariffsRequest, MessageType.getAllTariffsReply);
    map.set(MessageType.createTariffRequest, MessageType.createTariffReply);
    map.set(MessageType.updateTariffRequest, MessageType.updateTariffReply);
    map.set(MessageType.startDeviceRequest, MessageType.startDeviceReply);
    return map;
  }
}

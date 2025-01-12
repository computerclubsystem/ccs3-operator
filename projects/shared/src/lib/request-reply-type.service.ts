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
    map.set(MessageType.getTariffByIdRequest, MessageType.getTariffByIdReply);
    map.set(MessageType.createTariffRequest, MessageType.createTariffReply);
    map.set(MessageType.updateTariffRequest, MessageType.updateTariffReply);
    map.set(MessageType.startDeviceRequest, MessageType.startDeviceReply);
    map.set(MessageType.getDeviceStatusesRequest, MessageType.getDeviceStatusesReply);
    map.set(MessageType.getAllRolesRequest, MessageType.getAllRolesReply);
    map.set(MessageType.getRoleWithPermissionsRequest, MessageType.getRoleWithPermissionsReply);
    map.set(MessageType.getAllPermissionsRequest, MessageType.getAllPermissionsReply);
    map.set(MessageType.createRoleWithPermissionsRequest, MessageType.createRoleWithPermissionsReply);
    map.set(MessageType.updateRoleWithPermissionsRequest, MessageType.updateRoleWithPermissionsReply);
    return map;
  }
}

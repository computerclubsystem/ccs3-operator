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
    return map;
  }
}
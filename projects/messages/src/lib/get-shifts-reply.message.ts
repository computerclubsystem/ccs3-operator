import { ReplyMessage, Shift } from '@ccs3-operator/messages';
import { ShiftsSummary } from './entities/shifts-summary';

export interface GetShiftsReplyMessageBody {
  shifts: Shift[];
  shiftsSummary: ShiftsSummary;
}

export type GetShiftsReplyMessage = ReplyMessage<GetShiftsReplyMessageBody>;

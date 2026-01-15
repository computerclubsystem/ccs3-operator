import { UserWithTotalAndCount } from './user-with-total-and-count';

export interface ShiftStatus {
  completedSessionsTotal: number;
  completedSessionsCount: number;
  runningSessionsTotal: number;
  runningSessionsCount: number;
  continuationsTotal: number;
  continuationsCount: number;
  createdPrepaidTariffsCount: number;
  createdPrepaidTariffsTotal: number;
  rechargedPrepaidTariffsCount: number;
  rechargedPrepaidTariffsTotal: number;
  totalAmount: number;
  totalCount: number;
  runningTotal: number;
  completedTotal: number;
  completedSummaryByUser: UserWithTotalAndCount[];
  runningSummaryByUser: UserWithTotalAndCount[];
}

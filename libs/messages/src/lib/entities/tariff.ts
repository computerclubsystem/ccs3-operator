export const TariffType = {
  duration: 1,
  fromTo: 2,
  prepaid: 3,
} as const;
export type TariffType = typeof TariffType[keyof typeof TariffType];

export interface Tariff {
  id: number;
  name: string;
  description?: string | null;
  type: TariffType;
  duration?: number | null;
  fromTime?: number | null;
  toTime?: number | null;
  price: number;
  enabled: boolean;
  createdAt: string | null;
  updatedAt?: string | null;
  restrictStartFromTime?: number | null;
  restrictStartTime?: boolean | null;
  restrictStartToTime?: number | null;
  remainingSeconds?: number | null;
  canBeStartedByCustomer?: boolean | null;
  createdByUserId?: number | null;
  updatedByUserId?: number | null;
}

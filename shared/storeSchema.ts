import * as z from 'zod';

export const storeSchema = z.object({
  tab: z.number().default(0),
  streamerId: z.string().default(''),
  watch: z.boolean().default(false),
  rankChatLimit: z.number().default(50),
  rankChatViewCount: z.boolean().default(false),
  rankChatViewLastChat: z.boolean().default(false),
  rankChatStyle: z.string().default(''),
  rankDonationLimit: z.number().default(5),
  rankDonationViewCount: z.boolean().default(false),
  rankDonationViewLastChat: z.boolean().default(false),
  rankDonationStyle: z.string().default(''),
  newFanClubViewLastChat: z.boolean().default(false),
  newFanClubStyle: z.string().default(''),
  subscribeViewLastChat: z.boolean().default(false),
  subscribeStyle: z.string().default(''),
});

export type StoreType = z.output<typeof storeSchema>;

// 기본값은 스키마에서 자동 생성
export const storeDefaults: StoreType = storeSchema.parse({});

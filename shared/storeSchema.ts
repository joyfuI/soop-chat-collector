import * as z from 'zod';

export const storeSchema = z.object({
  tab: z.number().default(0),
  streamerId: z.string().default(''),
  rankChat: z
    .object({ limit: z.number(), viewCount: z.boolean(), style: z.string() })
    .default({ limit: 50, viewCount: false, style: '' }),
  rankDonation: z
    .object({ limit: z.number(), viewCount: z.boolean(), style: z.string() })
    .default({ limit: 5, viewCount: false, style: '' }),
});

export type StoreType = z.output<typeof storeSchema>;

// 기본값은 스키마에서 자동 생성
export const storeDefaults: StoreType = storeSchema.parse({});

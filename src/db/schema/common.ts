import { timestamp, pgEnum } from "drizzle-orm/pg-core";

export type Schedule = {
  day: string;
  startTime: string;
  endTime: string;
};

export const timestamps = {
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
};


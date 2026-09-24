import { z } from 'zod';

export const SystemIdSchema = z.coerce.number().int();

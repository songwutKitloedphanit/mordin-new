import { env } from '@/configs/env';

export const buildPrivatePath = (path: string) => {
  const base = (env.BASE_URL || '/').replace(/\/+$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return base ? `${base}${normalizedPath}` : normalizedPath;
};

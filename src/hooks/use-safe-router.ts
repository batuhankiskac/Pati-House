import { useRouter as useNextRouter } from 'next/navigation';

type NextRouter = ReturnType<typeof useNextRouter>;

const noop = () => {};

const fallbackRouter = {
  back: noop,
  forward: noop,
  prefetch: async () => {},
  push: async () => {},
  refresh: noop,
  replace: async () => {},
  redirect: () => {
    throw new Error('Router redirect is not supported in this environment.');
  },
} as NextRouter;

export function useSafeRouter(): NextRouter {
  try {
    return useNextRouter();
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('useRouter is unavailable, returning a fallback router.', error);
    }
    return fallbackRouter;
  }
}

import React from 'react';
import NextLink, { type LinkProps } from 'next/link';

type AnchorProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: React.ReactNode;
};

function renderFallbackLink(props: AnchorProps, ref: React.Ref<HTMLAnchorElement>) {
  const { href, children, ...rest } = props;
  const stringHref = typeof href === 'string' ? href : '#';
  return (
    <a ref={ref} href={stringHref} {...rest}>
      {children}
    </a>
  );
}

export const SafeLink = React.forwardRef<HTMLAnchorElement, LinkProps & AnchorProps>((props, ref) => {
  try {
    return <NextLink ref={ref} {...props} />;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Falling back to native <a> element because Next.js router context is unavailable.', error);
    }
    return renderFallbackLink(props, ref);
  }
});

SafeLink.displayName = 'SafeLink';

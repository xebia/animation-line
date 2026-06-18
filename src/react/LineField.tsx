import { useEffect, useRef } from 'react';
import { LineField } from '../core/LineField';
import type { LineFieldOptions } from '../core/types';

export function LineFieldReact(props: LineFieldOptions & { className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const { className, style, ...opts } = props;
  useEffect(() => {
    if (!ref.current) return;
    const field = new LineField(ref.current, opts);
    return () => field.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.variant]);
  return <div ref={ref} className={className} style={style} />;
}

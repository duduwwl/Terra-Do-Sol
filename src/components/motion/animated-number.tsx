// Adaptado de Motion Primitives (MIT) — https://motion-primitives.com/docs/animated-number
// Mudanças: formatação customizável (moeda), valor exato para leitores de tela,
// componente motion criado uma única vez e respeito a "reduzir movimento".
import { cn } from '../../lib/utils';
import { motion, SpringOptions, useReducedMotion, useSpring, useTransform } from 'motion/react';
import { useEffect, useMemo } from 'react';

export type AnimatedNumberProps = {
  value: number;
  className?: string;
  springOptions?: SpringOptions;
  as?: keyof JSX.IntrinsicElements;
  format?: (v: number) => string;
};

const defaultFormat = (v: number) => Math.round(v).toLocaleString('pt-BR');

export function AnimatedNumber({
  value,
  className,
  springOptions = { bounce: 0, duration: 600 },
  as = 'span',
  format = defaultFormat,
}: AnimatedNumberProps) {
  const MotionComponent = useMemo(() => motion.create(as), [as]);
  const reduce = useReducedMotion();
  const spring = useSpring(value, springOptions);
  const display = useTransform(spring, (current) => format(current));

  useEffect(() => {
    if (reduce) spring.jump(value);
    else spring.set(value);
  }, [spring, value, reduce]);

  return (
    <span className={cn('relative', className)}>
      <span className="sr-only">{format(value)}</span>
      <MotionComponent aria-hidden="true" data-value={format(value)}>
        {display}
      </MotionComponent>
    </span>
  );
}

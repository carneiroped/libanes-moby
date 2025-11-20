'use client';

import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';

import { cn } from '@/lib/utils';

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => {
  // Extrair apenas as props necessárias para passar ao componente root
  const { 
    ["aria-disabled"]: _ariaDisabled, 
    ["aria-label"]: ariaLabel,
    ["aria-labelledby"]: ariaLabelledby,
    ["aria-valuetext"]: ariaValuetext,
    min,
    max,
    value,
    ...restProps 
  } = props;
  
  // Obter o valor atual para aria-valuenow
  const valueCurrent = Array.isArray(value) ? value[0] : undefined;
  
  return (
    <div 
      role="group"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
      className={cn('slider-container')}
    >
      <SliderPrimitive.Root
        ref={ref}
        className={cn(
          'relative flex w-full touch-none select-none items-center',
          className
        )}
        {...restProps}
      >
        <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
          <SliderPrimitive.Range className="absolute h-full bg-primary" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb 
          role="slider"
          aria-orientation="horizontal"
          aria-labelledby={ariaLabelledby}
          aria-label={ariaLabel}
          aria-valuetext={ariaValuetext}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={valueCurrent}
          tabIndex={0}
          className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" 
        />
      </SliderPrimitive.Root>
    </div>
  );
});
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };

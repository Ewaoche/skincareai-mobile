import { ComponentProps } from 'react';
import { Pressable, Text, View } from 'react-native';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import { useResponsiveLayout } from './responsive';

type PressableProps = ComponentProps<typeof Pressable>;

type ButtonProps = PressableProps & {
  label: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  icon?: ReactNode;
};

export function Button({
  label,
  variant = 'primary',
  disabled = false,
  icon,
  style,
  ...pressableProps
}: ButtonProps) {
  const layout = useResponsiveLayout();

  return (
    <Pressable
      {...pressableProps}
      disabled={disabled}
      style={style}
      className={cn(
        'items-center justify-center border border-transparent',
        variant === 'primary' && 'bg-blush shadow-glow',
        variant === 'secondary' && 'bg-white/75 border border-white/70',
        variant === 'ghost' && 'bg-transparent',
        disabled && 'opacity-50',
      )}
      android_ripple={{ color: 'rgba(255,255,255,0.12)' }}
      accessibilityRole="button"
    >
      <View
        className="flex-row items-center justify-center gap-2"
        style={{
          minHeight: layout.isTablet ? 60 : 54,
          paddingHorizontal: layout.isTablet ? 24 : 20,
          paddingVertical: layout.isTablet ? 18 : 16,
          borderRadius: 999,
        }}
      >
        {icon}
        <Text
          className={cn(
            layout.isTablet ? 'font-bold text-[17px]' : 'font-bold text-base',
            variant === 'primary' ? 'text-white' : 'text-charcoal',
          )}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

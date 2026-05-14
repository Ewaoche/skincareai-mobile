import { ComponentProps } from 'react';
import { Pressable, Text, View } from 'react-native';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

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
  return (
    <Pressable
      {...pressableProps}
      disabled={disabled}
      style={style}
      className={cn(
        'items-center justify-center rounded-[22px] px-5 py-4',
        variant === 'primary' && 'bg-blush shadow-glow',
        variant === 'secondary' && 'bg-white/75 border border-white/70',
        variant === 'ghost' && 'bg-transparent',
        disabled && 'opacity-50',
      )}
    >
      <View className="flex-row items-center gap-2">
        {icon}
        <Text
          className={cn(
            'font-bold text-base',
            variant === 'primary' ? 'text-white' : 'text-charcoal',
          )}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

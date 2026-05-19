import { ReactNode, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { cn } from '@/lib/utils/cn';

type InputProps = {
  label?: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  placeholderTextColor?: string;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address' | 'numeric';
  leftAdornment?: ReactNode;
  showPasswordToggle?: boolean;
  containerClassName?: string;
  inputClassName?: string;
};

function PasswordVisibilityIcon({ visible }: { visible: boolean }) {
  if (visible) {
    return (
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <Path
          d="M2.5 12C4.5 8.3 8 6 12 6C16 6 19.5 8.3 21.5 12C19.5 15.7 16 18 12 18C8 18 4.5 15.7 2.5 12Z"
          stroke="#8F7885"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
          stroke="#8F7885"
          strokeWidth={1.8}
        />
      </Svg>
    );
  }

  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 3L21 21"
        stroke="#8F7885"
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Path
        d="M10.55 6.3C11.02 6.1 11.5 6 12 6C16 6 19.5 8.3 21.5 12C20.74 13.4 19.76 14.6 18.61 15.57"
        stroke="#8F7885"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M14.82 14.91C14.06 15.62 13.05 16.04 12 16.04C9.24 16.04 7 13.8 7 11.04C7 9.99 7.42 8.98 8.13 8.22"
        stroke="#8F7885"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M6 6.72C4.53 7.81 3.31 9.28 2.5 12C4.5 15.7 8 18 12 18C13.29 18 14.5 17.76 15.61 17.32"
        stroke="#8F7885"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function Input({
  label,
  value,
  onChangeText,
  placeholder,
  placeholderTextColor = '#9A9493',
  secureTextEntry,
  autoCapitalize = 'none',
  keyboardType = 'default',
  leftAdornment,
  showPasswordToggle = false,
  containerClassName,
  inputClassName,
}: InputProps) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const shouldShowPasswordToggle = showPasswordToggle && secureTextEntry;

  return (
    <View className={cn('gap-2', containerClassName)}>
      {label ? <Text className="font-medium text-sm text-mist">{label}</Text> : null}
      <View className="relative justify-center">
        {leftAdornment ? (
          <View className="absolute left-5 z-10">{leftAdornment}</View>
        ) : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={placeholderTextColor}
          secureTextEntry={secureTextEntry && !passwordVisible}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          className={cn(
            'rounded-[22px] border border-white/70 bg-white/80 px-5 py-4 font-sans text-base text-charcoal',
            leftAdornment ? 'pl-14' : '',
            shouldShowPasswordToggle ? 'pr-14' : '',
            inputClassName,
          )}
        />
        {shouldShowPasswordToggle ? (
          <Pressable
            onPress={() => setPasswordVisible((current) => !current)}
            className="absolute right-5 z-10"
            accessibilityRole="button"
            accessibilityLabel={passwordVisible ? 'Hide password' : 'Show password'}
          >
            <PasswordVisibilityIcon visible={passwordVisible} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

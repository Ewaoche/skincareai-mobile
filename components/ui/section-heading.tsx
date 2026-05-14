import { Text, View } from 'react-native';

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  body?: string;
};

export function SectionHeading({ eyebrow, title, body }: SectionHeadingProps) {
  return (
    <View className="gap-2">
      {eyebrow ? (
        <Text className="font-medium uppercase tracking-[2px] text-xs text-roseDeep">
          {eyebrow}
        </Text>
      ) : null}
      <Text className="font-extra text-[32px] leading-10 text-charcoal">
        {title}
      </Text>
      {body ? (
        <Text className="font-sans text-base leading-7 text-mist">{body}</Text>
      ) : null}
    </View>
  );
}

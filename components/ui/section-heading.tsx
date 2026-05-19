import { Text, View } from 'react-native';
import { useResponsiveLayout } from './responsive';

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  body?: string;
};

export function SectionHeading({ eyebrow, title, body }: SectionHeadingProps) {
  const layout = useResponsiveLayout();

  return (
    <View style={{ gap: layout.isTablet ? 14 : 12 }}>
      {eyebrow ? (
        <Text className="font-medium uppercase tracking-[2px] text-xs text-roseDeep">
          {eyebrow}
        </Text>
      ) : null}
      <Text
        className="font-extra text-charcoal"
        style={{
          fontSize: layout.isLargeTablet ? 42 : layout.isTablet ? 36 : 30,
          lineHeight: layout.isLargeTablet ? 48 : layout.isTablet ? 42 : 36,
          maxWidth: layout.isTablet ? 760 : undefined,
        }}
      >
        {title}
      </Text>
      {body ? (
        <Text
          className="font-sans text-mist"
          style={{
            fontSize: layout.isTablet ? 17 : 15,
            lineHeight: layout.isTablet ? 30 : 28,
            maxWidth: layout.isTablet ? 700 : undefined,
          }}
        >
          {body}
        </Text>
      ) : null}
    </View>
  );
}

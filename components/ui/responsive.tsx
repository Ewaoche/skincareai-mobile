import { PropsWithChildren, ReactNode } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';

export function useResponsiveLayout() {
  const { width, height } = useWindowDimensions();
  const shortestSide = Math.min(width, height);
  const isTablet = shortestSide >= 768;
  const isLargeTablet = shortestSide >= 1024;
  const isCompactPhone = shortestSide < 390 || height < 780;
  const horizontalPadding = isLargeTablet ? 36 : isTablet ? 28 : isCompactPhone ? 18 : 22;
  const contentMaxWidth = isLargeTablet ? 1160 : isTablet ? 940 : 680;
  const cardPadding = isTablet ? 28 : isCompactPhone ? 18 : 22;
  const heroHeight = isTablet ? 260 : isCompactPhone ? 172 : 214;
  const tabBarInset = isTablet ? 26 : 18;
  const tabBarHeight = isTablet ? 86 : 74;

  return {
    width,
    height,
    shortestSide,
    isTablet,
    isLargeTablet,
    isCompactPhone,
    horizontalPadding,
    contentMaxWidth,
    cardPadding,
    heroHeight,
    tabBarInset,
    tabBarHeight,
  };
}

type ResponsiveContentProps = PropsWithChildren<{
  topPadding?: number;
  bottomPadding?: number;
  gap?: number;
  header?: ReactNode;
}>;

export function ResponsiveContent({
  children,
  topPadding = 20,
  bottomPadding = 120,
  gap = 20,
  header,
}: ResponsiveContentProps) {
  const layout = useResponsiveLayout();

  return (
    <View
      style={[
        styles.outer,
        {
          paddingHorizontal: layout.horizontalPadding,
          paddingTop: topPadding,
          paddingBottom: bottomPadding,
        },
      ]}
    >
      <View style={[styles.inner, { maxWidth: layout.contentMaxWidth, gap }]}>
        {header}
        {children}
      </View>
    </View>
  );
}

type ResponsiveScrollScreenProps = PropsWithChildren<{
  topPadding?: number;
  bottomPadding?: number;
  gap?: number;
  header?: ReactNode;
}>;

export function ResponsiveScrollScreen({
  children,
  topPadding,
  bottomPadding,
  gap,
  header,
}: ResponsiveScrollScreenProps) {
  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <ResponsiveContent
        topPadding={topPadding}
        bottomPadding={bottomPadding}
        gap={gap}
        header={header}
      >
        {children}
      </ResponsiveContent>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  outer: {
    width: '100%',
    alignItems: 'center',
  },
  inner: {
    width: '100%',
  },
});

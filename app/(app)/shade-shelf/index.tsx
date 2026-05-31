import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Linking, Text, View } from 'react-native';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { GradientScreen } from '@/components/ui/gradient-screen';
import { ResponsiveScrollScreen, useResponsiveLayout } from '@/components/ui/responsive';
import { SectionHeading } from '@/components/ui/section-heading';
import {
  getSavedShadeShelf,
  removeSavedShade,
  SavedShadeItem,
} from '@/lib/api/shade-matching-api';

export default function ShadeShelfScreen() {
  const layout = useResponsiveLayout();
  const [items, setItems] = useState<SavedShadeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const nextItems = await getSavedShadeShelf();
      setItems(nextItems);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'We could not load your saved shade shelf.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const handleRemove = async (savedShadeId: string) => {
    try {
      setRemovingId(savedShadeId);
      setError(null);
      await removeSavedShade(savedShadeId);
      setItems((current) => current.filter((item) => item.id !== savedShadeId));
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : 'We could not remove this saved shade.');
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <GradientScreen>
      <ResponsiveScrollScreen topPadding={18} bottomPadding={layout.tabBarHeight + 72} gap={18}>
        <SectionHeading
          eyebrow="Saved Shade Shelf"
          title="The complexion shades you want to keep."
          body="This shelf is separate from skincare recommendations and routines."
        />

        {loading ? (
          <GlassCard>
            <ActivityIndicator color="#D96B8C" />
          </GlassCard>
        ) : error ? (
          <GlassCard>
            <Text className="font-sans text-sm text-roseDeep">{error}</Text>
          </GlassCard>
        ) : items.length === 0 ? (
          <GlassCard>
            <Text className="font-sans text-base leading-7 text-mist">
              Your saved shade shelf is empty. Save a shade from the result screen to keep it here.
            </Text>
          </GlassCard>
        ) : (
          items.map((item) => (
            <GlassCard key={item.id}>
              <View className="gap-4">
                <View className="gap-1">
                  <Text className="font-bold text-lg text-charcoal">
                    {item.shadeProduct.brand} {item.shadeProduct.productLine}
                  </Text>
                  <Text className="font-sans text-sm text-mist">
                    Shade {item.shadeProduct.shadeName}
                  </Text>
                </View>
                <View className="flex-row flex-wrap gap-2">
                  <View className="rounded-pill bg-white/70 px-3 py-2">
                    <Text className="font-medium text-xs text-charcoal">
                      {formatLabel(item.shadeProduct.productType)}
                    </Text>
                  </View>
                  <View className="rounded-pill bg-white/70 px-3 py-2">
                    <Text className="font-medium text-xs text-charcoal">
                      {formatLabel(item.shadeProduct.undertone)}
                    </Text>
                  </View>
                  <View className="rounded-pill bg-white/70 px-3 py-2">
                    <Text className="font-medium text-xs text-charcoal">
                      {formatLabel(item.shadeProduct.depthBand)}
                    </Text>
                  </View>
                </View>
                {item.notes ? (
                  <Text className="font-sans text-sm leading-6 text-mist">
                    {item.notes}
                  </Text>
                ) : null}
                <View className="gap-3">
                  <Button
                    label="Open Product"
                    onPress={() => {
                      void Linking.openURL(item.shadeProduct.affiliateUrl ?? item.shadeProduct.productUrl);
                    }}
                  />
                  <Button
                    label={removingId === item.id ? 'Removing...' : 'Remove'}
                    variant="secondary"
                    onPress={() => void handleRemove(item.id)}
                    disabled={removingId === item.id}
                  />
                </View>
              </View>
            </GlassCard>
          ))
        )}
      </ResponsiveScrollScreen>
    </GradientScreen>
  );
}

function formatLabel(value: string): string {
  return value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

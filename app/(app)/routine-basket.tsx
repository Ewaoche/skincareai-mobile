import { router } from 'expo-router';
import { Linking, ScrollView, Text, View } from 'react-native';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { GradientScreen } from '@/components/ui/gradient-screen';
import { SectionHeading } from '@/components/ui/section-heading';
import { useI18n } from '@/lib/i18n';
import { useRoutineBasketStore } from '@/stores/routine-basket-store';

export default function RoutineBasketScreen() {
  const { t } = useI18n();
  const items = useRoutineBasketStore((state) => state.items);
  const removeItem = useRoutineBasketStore((state) => state.removeItem);
  const clear = useRoutineBasketStore((state) => state.clear);

  return (
    <GradientScreen>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-6 px-6 pt-6">
          <SectionHeading
            eyebrow={t('basket.eyebrow')}
            title={t('basket.title')}
            body={t('basket.body', { count: items.length })}
          />

          {items.length === 0 ? (
            <GlassCard>
              <View className="gap-4">
                <Text className="font-sans text-base leading-7 text-mist">
                  {t('basket.empty')}
                </Text>
                <Button
                  label={t('basket.back')}
                  variant="secondary"
                  onPress={() => router.back()}
                />
              </View>
            </GlassCard>
          ) : (
            <>
              <GlassCard>
                <View className="gap-3">
                  <Button
                    label={t('basket.clear')}
                    variant="secondary"
                    onPress={clear}
                  />
                </View>
              </GlassCard>

              {items.map((item) => (
                <GlassCard key={item.productId}>
                  <View className="gap-4">
                    <View className="gap-1">
                      <Text className="font-bold text-lg text-charcoal">
                        {item.name}
                      </Text>
                      <Text className="font-sans text-sm text-mist">
                        {item.brand}
                      </Text>
                    </View>
                    {item.category ? (
                      <Text className="font-sans text-sm text-mist">
                        {item.category}
                      </Text>
                    ) : null}
                    {item.priceEur ? (
                      <Text className="font-medium text-sm text-charcoal">
                        {t('common.priceEur', { price: item.priceEur })}
                      </Text>
                    ) : null}
                    <View className="gap-3">
                      <Button
                        label={t('basket.buy')}
                        onPress={() => {
                          void Linking.openURL(item.buyUrl);
                        }}
                      />
                      <Button
                        label={t('basket.remove')}
                        variant="secondary"
                        onPress={() => removeItem(item.productId)}
                      />
                    </View>
                  </View>
                </GlassCard>
              ))}
            </>
          )}
        </View>
      </ScrollView>
    </GradientScreen>
  );
}

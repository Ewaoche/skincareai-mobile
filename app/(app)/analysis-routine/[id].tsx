import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { GradientScreen } from '@/components/ui/gradient-screen';
import { SectionHeading } from '@/components/ui/section-heading';
import {
  AnalysisRoutineResponse,
  getAnalysisRoutine,
} from '@/lib/api/analysis-api';
import { useI18n } from '@/lib/i18n';
import { useRoutineBasketStore } from '@/stores/routine-basket-store';

export default function AnalysisRoutineScreen() {
  const { t } = useI18n();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const analysisId = Array.isArray(params.id) ? params.id[0] : params.id;
  const addRoutineItems = useRoutineBasketStore((state) => state.addRoutineItems);
  const basketItems = useRoutineBasketStore((state) => state.items);
  const [routine, setRoutine] = useState<AnalysisRoutineResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!analysisId) {
      setError(t('routine.missingId'));
      setLoading(false);
      return;
    }

    const loadRoutine = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getAnalysisRoutine(analysisId);
        setRoutine(response);
      } catch {
        setError(t('routine.loadError'));
      } finally {
        setLoading(false);
      }
    };

    void loadRoutine();
  }, [analysisId, t]);

  const handleAddFullRoutine = () => {
    if (!routine || routine.basketItems.length === 0) {
      return;
    }

    addRoutineItems(routine.basketItems);
  };

  return (
    <GradientScreen>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-6 px-6 pt-6">
          <SectionHeading
            eyebrow={t('routine.eyebrow')}
            title={t('routine.title')}
            body={t('routine.body')}
          />

          {loading ? (
            <GlassCard>
              <ActivityIndicator color="#D96B8C" />
            </GlassCard>
          ) : error ? (
            <GlassCard>
              <View className="gap-4">
                <Text className="font-sans text-sm text-roseDeep">{error}</Text>
                <Button
                  label={t('routine.backRecommendations')}
                  variant="secondary"
                  onPress={() => router.back()}
                />
              </View>
            </GlassCard>
          ) : !routine ? null : (
            <>
              <GlassCard>
                <View className="gap-4">
                  <Text className="font-bold text-lg text-charcoal">
                    {t('routine.basketTitle')}
                  </Text>
                  <Text className="font-sans text-base leading-7 text-mist">
                    {t('routine.basketBody', {
                      count: routine.basketItems.length,
                    })}
                  </Text>
                  <View className="gap-3">
                    <Button
                      label={t('routine.addFullRoutine')}
                      onPress={handleAddFullRoutine}
                      disabled={routine.basketItems.length === 0}
                    />
                    <Button
                      label={t('routine.openBasket', {
                        count: basketItems.length,
                      })}
                      variant="secondary"
                      onPress={() => router.push('/routine-basket' as never)}
                    />
                  </View>
                </View>
              </GlassCard>

              <RoutinePeriodCard
                title={t('routine.morning')}
                emptyLabel={t('routine.emptyMorning')}
                steps={routine.morning}
              />

              <RoutinePeriodCard
                title={t('routine.night')}
                emptyLabel={t('routine.emptyNight')}
                steps={routine.night}
              />

              <GlassCard>
                <View className="gap-4">
                  <Text className="font-bold text-lg text-charcoal">
                    {t('routine.productsTitle')}
                  </Text>
                  {routine.basketItems.map((item) => (
                    <View
                      key={item.productId}
                      className="gap-3 rounded-[22px] bg-white/70 px-4 py-4"
                    >
                      <View className="flex-row items-start gap-4">
                        {item.imageUrl ? (
                          <Image
                            source={{ uri: item.imageUrl }}
                            className="h-20 w-20 rounded-[18px]"
                            resizeMode="cover"
                          />
                        ) : null}
                        <View className="flex-1 gap-1">
                          <Text className="font-bold text-base text-charcoal">
                            {item.name}
                          </Text>
                          <Text className="font-sans text-sm text-mist">
                            {item.brand}
                          </Text>
                          {item.category ? (
                            <Text className="font-sans text-xs text-mist">
                              {item.category}
                            </Text>
                          ) : null}
                          {item.priceEur ? (
                            <Text className="font-medium text-sm text-charcoal">
                              {t('common.priceEur', { price: item.priceEur })}
                            </Text>
                          ) : null}
                        </View>
                      </View>
                      <Button
                        label={t('routine.buyProduct')}
                        variant="secondary"
                        onPress={() => {
                          void Linking.openURL(item.buyUrl);
                        }}
                      />
                    </View>
                  ))}
                </View>
              </GlassCard>

              <InfoListCard
                title={t('routine.notesTitle')}
                emptyLabel={t('routine.notesEmpty')}
                items={routine.notes}
              />

              <InfoListCard
                title={t('routine.cautionsTitle')}
                emptyLabel={t('routine.cautionsEmpty')}
                items={routine.cautions}
              />
            </>
          )}
        </View>
      </ScrollView>
    </GradientScreen>
  );
}

function RoutinePeriodCard({
  title,
  emptyLabel,
  steps,
}: {
  title: string;
  emptyLabel: string;
  steps: AnalysisRoutineResponse['morning'];
}) {
  return (
    <GlassCard>
      <View className="gap-4">
        <Text className="font-bold text-lg text-charcoal">{title}</Text>
        {steps.length === 0 ? (
          <Text className="font-sans text-base leading-7 text-mist">
            {emptyLabel}
          </Text>
        ) : (
          steps.map((step) => (
            <View
              key={`${step.period}-${step.step}-${step.productId ?? 'info'}`}
              className="gap-2 rounded-[22px] bg-white/70 px-4 py-4"
            >
              <Text className="font-medium text-xs uppercase tracking-[1.4px] text-roseDeep">
                {title} {step.step}
              </Text>
              <Text className="font-bold text-base text-charcoal">
                {step.label}
              </Text>
              <Text className="font-sans text-base leading-7 text-mist">
                {step.instruction}
              </Text>
            </View>
          ))
        )}
      </View>
    </GlassCard>
  );
}

function InfoListCard({
  title,
  emptyLabel,
  items,
}: {
  title: string;
  emptyLabel: string;
  items: string[];
}) {
  return (
    <GlassCard>
      <View className="gap-4">
        <Text className="font-bold text-lg text-charcoal">{title}</Text>
        {items.length === 0 ? (
          <Text className="font-sans text-base leading-7 text-mist">
            {emptyLabel}
          </Text>
        ) : (
          items.map((item, index) => (
            <View
              key={`${title}-${index}`}
              className="rounded-[22px] bg-white/70 px-4 py-4"
            >
              <Text className="font-sans text-base leading-7 text-mist">
                {item}
              </Text>
            </View>
          ))
        )}
      </View>
    </GlassCard>
  );
}

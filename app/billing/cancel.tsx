import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { GradientScreen } from '@/components/ui/gradient-screen';
import { SectionHeading } from '@/components/ui/section-heading';
import { useI18n } from '@/lib/i18n';

export default function BillingCancelScreen() {
  const { t } = useI18n();
  return (
    <GradientScreen>
      <View className="flex-1 justify-center px-6 pb-16 pt-10">
        <GlassCard>
          <View className="gap-5">
            <SectionHeading
              eyebrow={t('billing.cancel.eyebrow')}
              title={t('billing.cancel.title')}
              body={t('billing.cancel.body')}
            />
            <Text className="font-sans text-sm text-mist">
              {t('billing.cancel.note')}
            </Text>
            <Button
              label={t('billing.returnSubscription')}
              onPress={() =>
                router.replace({
                  pathname: '/subscription' as never,
                })
              }
            />
            <Button
              label={t('billing.returnHome')}
              variant="secondary"
              onPress={() => router.replace('/(app)/(tabs)/home')}
            />
          </View>
        </GlassCard>
      </View>
    </GradientScreen>
  );
}

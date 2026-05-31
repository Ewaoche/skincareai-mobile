import { router, useLocalSearchParams } from 'expo-router';
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
  getShadeApiErrorMessage,
  getShadeMatchProfile,
  getShadeMatchResults,
  saveShadeToShelf,
  ShadeMatchProfile,
  ShadeMatchResultItem,
} from '@/lib/api/shade-matching-api';
import { describeShadeConfidence } from '@/lib/shade/selfie-validation';
import { useSubscriptionStore } from '@/stores/subscription-store';

export default function ShadeMatchResultScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const profileId = Array.isArray(params.id) ? params.id[0] : params.id;
  const usage = useSubscriptionStore((state) => state.usage);
  const subscriptionError = useSubscriptionStore((state) => state.error);
  const refreshSubscription = useSubscriptionStore((state) => state.refresh);
  const [profile, setProfile] = useState<ShadeMatchProfile | null>(null);
  const [items, setItems] = useState<ShadeMatchResultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    void refreshSubscription().catch(() => {
      // The screen renders the subscription error state below.
    });
  }, [refreshSubscription]);

  useEffect(() => {
    if (!profileId) {
      setError('The shade profile identifier is missing.');
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const [nextProfile, results] = await Promise.all([
          getShadeMatchProfile(profileId),
          getShadeMatchResults(profileId),
        ]);
        setProfile(nextProfile);
        setItems(results.items);
      } catch (loadError) {
        setError(getShadeApiErrorMessage(loadError));
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [profileId]);

  const handleSave = async (shadeProductId: string) => {
    if (!profileId || savingId) {
      return;
    }

    try {
      setSavingId(shadeProductId);
      await saveShadeToShelf({
        shadeProductId,
        profileId,
      });
    } catch (saveError) {
      setError(getShadeApiErrorMessage(saveError));
    } finally {
      setSavingId(null);
    }
  };

  const confidenceSummary = profile
    ? describeShadeConfidence(profile.confidenceScore)
    : null;

  return (
    <GradientScreen>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-6 px-6 pt-6">
          <SectionHeading
            eyebrow="Shade Result"
            title="Your complexion profile and top shade candidates."
            body="Use this screen to review your undertone, depth band, and the shades worth saving."
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
                  label="Back"
                  variant="secondary"
                  onPress={() => router.back()}
                />
              </View>
            </GlassCard>
          ) : profile ? (
            <>
              <GlassCard>
                <View className="gap-4">
                  {profile.selfieUrl ? (
                    <Image
                      source={{ uri: profile.selfieUrl }}
                      className="h-[260px] w-full rounded-[24px]"
                      resizeMode="cover"
                    />
                  ) : null}
                  <View className="flex-row gap-3">
                    <View className="flex-1 rounded-[22px] bg-white/70 px-4 py-4">
                      <Text className="font-medium text-xs uppercase tracking-[1.4px] text-roseDeep">
                        Undertone
                      </Text>
                      <Text className="mt-2 font-bold text-lg text-charcoal">
                        {formatLabel(profile.undertone)}
                      </Text>
                    </View>
                    <View className="flex-1 rounded-[22px] bg-white/70 px-4 py-4">
                      <Text className="font-medium text-xs uppercase tracking-[1.4px] text-roseDeep">
                        Depth
                      </Text>
                      <Text className="mt-2 font-bold text-lg text-charcoal">
                        {formatLabel(profile.depthBand)}
                      </Text>
                    </View>
                  </View>
                  <View className="rounded-[22px] bg-white/70 px-4 py-4">
                    <Text className="font-medium text-xs uppercase tracking-[1.4px] text-roseDeep">
                      Confidence
                    </Text>
                    <Text className="mt-2 font-bold text-lg text-charcoal">
                      {Math.round(profile.confidenceScore * 100)}%{' '}
                      {confidenceSummary ? `- ${confidenceSummary.label}` : ''}
                    </Text>
                    <Text className="mt-2 font-sans text-sm leading-6 text-mist">
                      {confidenceSummary?.body ??
                        'This result blends selfie quality checks with sampled color extraction to estimate your best shade candidates.'}
                    </Text>
                  </View>
                  <Button
                    label="Open Saved Shade Shelf"
                    variant="secondary"
                    onPress={() => router.push('/shade-shelf' as never)}
                  />
                </View>
              </GlassCard>

              <GlassCard>
                <View className="gap-3">
                  <Text className="font-bold text-lg text-charcoal">
                    Shade match access
                  </Text>
                  {usage ? (
                    <View className="rounded-[22px] bg-white/70 px-4 py-4">
                      <Text className="font-medium text-xs uppercase tracking-[1.4px] text-roseDeep">
                        Remaining analyses
                      </Text>
                      <Text className="mt-2 font-bold text-lg text-charcoal">
                        {usage.remainingShadeMatches} of {usage.shadeMatchesLimit}
                      </Text>
                      <Text className="mt-2 font-sans text-sm leading-6 text-mist">
                        {usage.canStartShadeMatch
                          ? 'You can run another shade match when you are ready.'
                          : usage.shadeReason ??
                            'Your current plan cannot start another shade match right now.'}
                      </Text>
                    </View>
                  ) : subscriptionError ? (
                    <Text className="font-sans text-sm text-roseDeep">
                      {subscriptionError}
                    </Text>
                  ) : (
                    <View className="flex-row items-center gap-3">
                      <ActivityIndicator color="#D96B8C" />
                      <Text className="font-sans text-sm text-mist">
                        Refreshing your shade match access.
                      </Text>
                    </View>
                  )}
                  <Button
                    label={
                      usage?.canStartShadeMatch
                        ? 'Manage Subscription'
                        : 'Upgrade For More Shade Matches'
                    }
                    variant="secondary"
                    onPress={() => router.push('/subscription' as never)}
                  />
                </View>
              </GlassCard>

              {items.map((item) => (
                <GlassCard key={item.id}>
                  <View className="gap-4">
                    <View className="flex-row items-start justify-between gap-4">
                      <View className="flex-1 gap-1">
                        <Text className="font-medium text-xs uppercase tracking-[1.4px] text-roseDeep">
                          Rank {item.rank}
                        </Text>
                        <Text className="font-bold text-xl text-charcoal">
                          {item.shadeProduct.brand} {item.shadeProduct.productLine}
                        </Text>
                        <Text className="font-sans text-sm text-mist">
                          Shade {item.shadeProduct.shadeName}
                        </Text>
                      </View>
                      <Text className="font-extra text-lg text-charcoal">
                        {Math.round(item.matchScore * 100)}%
                      </Text>
                    </View>

                    {item.shadeProduct.imageUrl ? (
                      <Image
                        source={{ uri: item.shadeProduct.imageUrl }}
                        className="h-[220px] w-full rounded-[24px]"
                        resizeMode="cover"
                      />
                    ) : null}

                    <View className="rounded-[22px] bg-white/70 px-4 py-4">
                      <Text className="font-medium text-xs uppercase tracking-[1.4px] text-roseDeep">
                        Match context
                      </Text>
                      <Text className="mt-2 font-sans text-base leading-7 text-mist">
                        {item.reasonSummary}
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

                    <View className="gap-3">
                      <Button
                        label={
                          savingId === item.shadeProduct.id
                            ? 'Saving...'
                            : 'Save To Shade Shelf'
                        }
                        onPress={() => void handleSave(item.shadeProduct.id)}
                        disabled={savingId === item.shadeProduct.id}
                      />
                      <Button
                        label="Open Product"
                        variant="secondary"
                        onPress={() => {
                          void Linking.openURL(
                            item.shadeProduct.affiliateUrl ??
                              item.shadeProduct.productUrl,
                          );
                        }}
                      />
                    </View>
                  </View>
                </GlassCard>
              ))}
            </>
          ) : null}
        </View>
      </ScrollView>
    </GradientScreen>
  );
}

function formatLabel(value?: string | null): string {
  if (!value) {
    return 'Pending';
  }

  return value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

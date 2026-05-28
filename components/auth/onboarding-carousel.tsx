import { useRef, useState } from 'react';
import {
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useI18n } from '@/lib/i18n';

type Slide = {
  id: string;
  title: string;
  body: string;
  cta: string;
  kind: 'scan' | 'regimen' | 'progress';
};

const acneImage = require('../../assets/onboarding/acne2.jpeg');
const creamImage = require('../../assets/onboarding/cream.jpeg');
const equipmentImage = require('../../assets/onboarding/eq.jpeg');

function ScanIllustration({ compact }: { compact: boolean }) {
  return (
    <View className="flex-1 items-center justify-center px-4 py-4">
      <View className="absolute left-3 top-4 h-24 w-24 rounded-full bg-lavender/20" />
      <View className="absolute right-5 top-6 h-16 w-16 rounded-full bg-peach/40" />

      <View
        className={`overflow-hidden rounded-[30px] border-4 border-charcoal bg-charcoal p-2 shadow-soft ${
          compact ? 'h-[210px] w-[150px]' : 'h-[238px] w-[170px]'
        } rotate-[8deg]`}
      >
        <View className="flex-1 overflow-hidden rounded-[24px] bg-white">
          <Image source={acneImage} className="h-full w-full" resizeMode="cover" />

          <View className="absolute inset-4">
            <View className="absolute left-0 top-0 h-7 w-7 border-l-2 border-t-2 border-white/90" />
            <View className="absolute right-0 top-0 h-7 w-7 border-r-2 border-t-2 border-white/90" />
            <View className="absolute bottom-0 left-0 h-7 w-7 border-b-2 border-l-2 border-white/90" />
            <View className="absolute bottom-0 right-0 h-7 w-7 border-b-2 border-r-2 border-white/90" />
          </View>

          <LinearGradient
            colors={['transparent', 'rgba(201,182,255,0.95)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: '52%',
              height: 3,
            }}
          />
        </View>
      </View>
    </View>
  );
}

function RegimenIllustration({
  compact,
  labels,
}: {
  compact: boolean;
  labels: {
    targetedCare: string;
    beautyTools: string;
    cleanse: string;
    treat: string;
    protect: string;
  };
}) {
  return (
    <View className="flex-1 justify-center px-4 py-4">
      <View className="absolute left-6 top-4 rounded-pill bg-white/75 px-3 py-1.5">
        <Text className="font-medium text-[11px] text-mist">{labels.targetedCare}</Text>
      </View>
      <View className="absolute right-6 top-4 rounded-pill bg-white/75 px-3 py-1.5">
        <Text className="font-medium text-[11px] text-mist">{labels.beautyTools}</Text>
      </View>

      <View className="mt-6 flex-row items-end justify-center gap-3">
        <View
          className={`overflow-hidden rounded-[24px] border border-white/80 bg-white/70 shadow-soft ${
            compact ? 'h-[170px] w-[96px] p-3' : 'h-[196px] w-[110px] p-4'
          }`}
        >
          <Image source={creamImage} className="h-full w-full" resizeMode="contain" />
        </View>

        <View
          className={`overflow-hidden rounded-[24px] border border-white/80 bg-white/70 shadow-soft ${
            compact ? 'h-[150px] w-[118px] p-2' : 'h-[176px] w-[136px] p-3'
          }`}
        >
          <Image source={equipmentImage} className="h-full w-full" resizeMode="contain" />
        </View>
      </View>

      <View className="mt-4 flex-row justify-center gap-2">
        <View className="rounded-pill bg-white/70 px-3 py-1.5">
          <Text className="font-medium text-[11px] text-mist">{labels.cleanse}</Text>
        </View>
        <View className="rounded-pill bg-white/70 px-3 py-1.5">
          <Text className="font-medium text-[11px] text-mist">{labels.treat}</Text>
        </View>
        <View className="rounded-pill bg-white/70 px-3 py-1.5">
          <Text className="font-medium text-[11px] text-mist">{labels.protect}</Text>
        </View>
      </View>
    </View>
  );
}

function ProgressIllustration({ compact }: { compact: boolean }) {
  return (
    <View className="flex-1 items-center justify-center px-4 py-4">
      <View className="h-full w-full overflow-hidden rounded-[24px] border border-white/80 bg-white/50">
        <Image source={acneImage} className="h-full w-full" resizeMode="cover" />

        <View className="absolute left-1/2 top-0 ml-[-10px] h-full w-5 rounded-full bg-white/80">
          <View
            className="absolute left-[3px] top-3 w-2 rounded-full bg-charcoal/15"
            style={{ height: compact ? 145 : 175 }}
          />
          <View
            className="absolute left-[-5px] rounded-full border border-white/85 bg-white/95"
            style={{ top: compact ? 70 : 86, height: 30, width: 30 }}
          />
        </View>

        <View className="absolute right-8 top-10 h-5 w-5 items-center justify-center rounded-full bg-mint">
          <Text className="text-[10px] text-white">+</Text>
        </View>
        <View className="absolute right-14 top-24 h-5 w-5 items-center justify-center rounded-full bg-mint">
          <Text className="text-[10px] text-white">+</Text>
        </View>
        <View className="absolute right-9 top-36 h-5 w-5 items-center justify-center rounded-full bg-mint">
          <Text className="text-[10px] text-white">+</Text>
        </View>
      </View>
    </View>
  );
}

function SlideArt({
  kind,
  compact,
  regimenLabels,
}: {
  kind: Slide['kind'];
  compact: boolean;
  regimenLabels: {
    targetedCare: string;
    beautyTools: string;
    cleanse: string;
    treat: string;
    protect: string;
  };
}) {
  if (kind === 'scan') {
    return <ScanIllustration compact={compact} />;
  }

  if (kind === 'regimen') {
    return <RegimenIllustration compact={compact} labels={regimenLabels} />;
  }

  return <ProgressIllustration compact={compact} />;
}

function SlideCard({
  slide,
  activeIndex,
  compact,
  onPressPrimary,
  regimenLabels,
  slideCount,
}: {
  slide: Slide;
  activeIndex: number;
  compact: boolean;
  onPressPrimary: () => void;
  regimenLabels: {
    targetedCare: string;
    beautyTools: string;
    cleanse: string;
    treat: string;
    protect: string;
  };
  slideCount: number;
}) {
  return (
    <View className="flex-1 justify-center px-5">
      <View className="absolute -left-10 top-20 h-56 w-56 rounded-full bg-lavender/10" />
      <View className="absolute -right-12 bottom-32 h-56 w-56 rounded-full bg-peach/25" />

      <View className="overflow-hidden rounded-[42px] border border-white/70 bg-white/45 shadow-soft">
        <BlurView intensity={26} tint="light">
          <LinearGradient
            colors={['rgba(255,255,255,0.82)', 'rgba(255,245,241,0.88)', 'rgba(245,239,255,0.82)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ paddingHorizontal: 22, paddingVertical: 24 }}
          >
            <Text
              className={`text-center font-extra tracking-[-1px] text-charcoal ${
                compact ? 'text-[38px] leading-[40px]' : 'text-[46px] leading-[48px]'
              }`}
            >
              {slide.title}
            </Text>

            <Text
              className={`mt-4 text-center font-sans text-charcoal/85 ${
                compact ? 'text-[16px] leading-6' : 'text-[18px] leading-7'
              }`}
            >
              {slide.body}
            </Text>

            <View
              className={`mt-7 overflow-hidden rounded-[30px] border border-white/75 bg-white/35 ${
                compact ? 'h-[255px]' : 'h-[315px]'
              }`}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.55)', 'rgba(203,208,212,0.24)', 'rgba(255,255,255,0.42)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ flex: 1 }}
              >
                <SlideArt
                  kind={slide.kind}
                  compact={compact}
                  regimenLabels={regimenLabels}
                />
              </LinearGradient>
            </View>

            <View className="mt-6 items-center">
              <View className="mb-7 flex-row gap-2.5">
                {Array.from({ length: slideCount }).map((_, index) => (
                  <View
                    key={`${slide.id}-dot-${index}`}
                    className={`h-1.5 rounded-full ${
                      index === activeIndex ? 'w-9 bg-blush' : 'w-2.5 bg-blush/25'
                    }`}
                  />
                ))}
              </View>

              <Pressable
                onPress={onPressPrimary}
                className="w-full overflow-hidden rounded-pill"
              >
                <LinearGradient
                  colors={['#E88CA8', '#D97897']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ paddingVertical: 16, alignItems: 'center' }}
                >
                  <Text className="font-bold text-[17px] text-white">
                    {slide.cta}
                  </Text>
                </LinearGradient>
              </Pressable>
            </View>
          </LinearGradient>
        </BlurView>
      </View>
    </View>
  );
}

export default function OnboardingCarousel() {
  const { t } = useI18n();
  const { width, height } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const compact = width < 390 || height < 800;
  const slides: Slide[] = [
    {
      id: 'scan',
      title: t('onboarding.scan.title'),
      body: t('onboarding.scan.body'),
      cta: t('onboarding.scan.cta'),
      kind: 'scan',
    },
    {
      id: 'regimen',
      title: t('onboarding.regimen.title'),
      body: t('onboarding.regimen.body'),
      cta: t('onboarding.regimen.cta'),
      kind: 'regimen',
    },
    {
      id: 'progress',
      title: t('onboarding.progress.title'),
      body: t('onboarding.progress.body'),
      cta: t('onboarding.progress.cta'),
      kind: 'progress',
    },
  ];
  const regimenLabels = {
    targetedCare: t('onboarding.tag.targetedCare'),
    beautyTools: t('onboarding.tag.beautyTools'),
    cleanse: t('onboarding.tag.cleanse'),
    treat: t('onboarding.tag.treat'),
    protect: t('onboarding.tag.protect'),
  };

  const handleMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setActiveIndex(Math.round(event.nativeEvent.contentOffset.x / width));
  };

  const handlePress = () => {
    if (activeIndex === slides.length - 1) {
      router.push('/(auth)/register');
      return;
    }

    scrollRef.current?.scrollTo({
      x: width * (activeIndex + 1),
      animated: true,
    });
  };

  return (
    <View className="flex-1 bg-[#FFF9F7]">
      <View className="flex-row justify-end px-6 pb-2 pt-4">
        <Pressable onPress={() => router.push('/(auth)/login')}>
          <Text className="font-medium text-xs uppercase tracking-[2px] text-mist">
            {t('onboarding.skip')}
          </Text>
        </Pressable>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumEnd}
        decelerationRate="fast"
        className="flex-1"
      >
        {slides.map((slide) => (
          <View key={slide.id} style={{ width }}>
            <SlideCard
              slide={slide}
              activeIndex={activeIndex}
              compact={compact}
              onPressPrimary={handlePress}
              regimenLabels={regimenLabels}
              slideCount={slides.length}
            />
          </View>
        ))}
      </ScrollView>

      <View className="pb-10 pt-4">
        <Pressable onPress={() => router.push('/(auth)/login')}>
          <Text className="text-center font-medium text-sm text-mist">
            {t('onboarding.alreadyMember')}{' '}
            <Text className="text-roseDeep">{t('onboarding.logIn')}</Text>
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

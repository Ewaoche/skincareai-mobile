import { Pressable, Text, View } from 'react-native';
import Svg, { Circle, Line, Polyline } from 'react-native-svg';
import { GlassCard } from '@/components/ui/glass-card';
import { useResponsiveLayout } from '@/components/ui/responsive';

export type ProgressMetricOption = {
  key: string;
  label: string;
};

export type ProgressChartDatum = {
  label: string;
  shortLabel: string;
  value: number;
};

type ProgressChartCardProps = {
  title: string;
  description: string;
  options: ProgressMetricOption[];
  selectedKey: string;
  onSelect: (key: string) => void;
  data: ProgressChartDatum[];
  latestValue: number | null;
  deltaValue: number | null;
  deltaLabel: string;
};

export function ProgressChartCard({
  title,
  description,
  options,
  selectedKey,
  onSelect,
  data,
  latestValue,
  deltaValue,
  deltaLabel,
}: ProgressChartCardProps) {
  const layout = useResponsiveLayout();
  const width = layout.isTablet ? 720 : 320;
  const height = 220;
  const paddingX = 22;
  const paddingY = 22;
  const chartBottom = height - 36;
  const chartTop = paddingY;
  const chartLeft = paddingX;
  const chartRight = width - paddingX;
  const valueRange = 100;

  const points = data.map((item, index) => {
    const x =
      data.length === 1
        ? (chartLeft + chartRight) / 2
        : chartLeft + (index * (chartRight - chartLeft)) / (data.length - 1);
    const y =
      chartBottom - ((item.value ?? 0) / valueRange) * (chartBottom - chartTop);

    return { ...item, x, y };
  });

  const polylinePoints = points.map((point) => `${point.x},${point.y}`).join(' ');
  const latestPoint = points[points.length - 1] ?? null;
  const tone =
    deltaValue === null
      ? 'text-mist'
      : deltaValue >= 0
        ? 'text-emerald-600'
        : 'text-roseDeep';

  return (
    <GlassCard>
      <View className="gap-5">
        <View className="gap-2">
          <Text className="font-bold text-xl text-charcoal">{title}</Text>
          <Text className="font-sans text-sm leading-6 text-mist">
            {description}
          </Text>
        </View>

        <View className="flex-row flex-wrap gap-3">
          {options.map((option) => {
            const active = option.key === selectedKey;

            return (
              <Pressable
                key={option.key}
                onPress={() => onSelect(option.key)}
                className={`rounded-full px-4 py-3 ${
                  active ? 'bg-roseDeep' : 'bg-white/70'
                }`}
              >
                <Text
                  className={`text-xs font-semibold uppercase tracking-[1.4px] ${
                    active ? 'text-white' : 'text-charcoal'
                  }`}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View className="overflow-hidden rounded-[28px] bg-white/65 px-4 py-5">
          <Svg
            width="100%"
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
          >
            {[0, 25, 50, 75, 100].map((tick) => {
              const y =
                chartBottom - (tick / valueRange) * (chartBottom - chartTop);

              return (
                <Line
                  key={tick}
                  x1={chartLeft}
                  y1={y}
                  x2={chartRight}
                  y2={y}
                  stroke="rgba(199, 168, 176, 0.35)"
                  strokeDasharray="5 6"
                  strokeWidth={1}
                />
              );
            })}

            {points.length > 1 ? (
              <Polyline
                points={polylinePoints}
                fill="none"
                stroke="#E88CA8"
                strokeWidth={5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : null}

            {points.map((point, index) => (
              <Circle
                key={`${point.label}-${index}`}
                cx={point.x}
                cy={point.y}
                r={latestPoint?.label === point.label ? 6 : 4.5}
                fill={latestPoint?.label === point.label ? '#8B3A3A' : '#E88CA8'}
              />
            ))}
          </Svg>

          <View className="mt-3 flex-row justify-between gap-2">
            {points.map((point, index) => (
              <View
                key={`${point.shortLabel}-${index}`}
                style={{ flex: 1 }}
                className="items-center"
              >
                <Text className="text-[11px] font-medium uppercase tracking-[1.2px] text-mist">
                  {point.shortLabel}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View
          style={{
            flexDirection: layout.isTablet ? 'row' : 'column',
            gap: 12,
          }}
        >
          <View className="flex-1 rounded-[22px] bg-white/70 px-4 py-4">
            <Text className="text-xs font-semibold uppercase tracking-[1.4px] text-roseDeep">
              Latest score
            </Text>
            <Text className="mt-2 font-extra text-[34px] leading-[36px] text-charcoal">
              {latestValue ?? '--'}
            </Text>
          </View>

          <View className="flex-1 rounded-[22px] bg-white/70 px-4 py-4">
            <Text className="text-xs font-semibold uppercase tracking-[1.4px] text-roseDeep">
              Since first scan
            </Text>
            <Text className={`mt-2 font-extra text-[28px] leading-[30px] ${tone}`}>
              {deltaValue === null ? '--' : `${deltaValue > 0 ? '+' : ''}${deltaValue}`}
            </Text>
            <Text className="mt-2 font-sans text-sm leading-6 text-mist">
              {deltaLabel}
            </Text>
          </View>
        </View>
      </View>
    </GlassCard>
  );
}

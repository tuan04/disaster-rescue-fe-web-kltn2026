import type { MapPointDetailRes, MapPointRes } from '@/types/dispatch';

import LeafletRescueMap from './leaflet/LeafletRescueMap';

export type RescueMapProps = {
  center: [number, number];
  points: MapPointRes[];
  zoom?: number;
  onPointDetailRequest?: (pointId: string) => void;
  selectedPointDetail?: MapPointDetailRes | null;
  detailLoading?: boolean;
  detailError?: Error | null;
};

export default function RescueMap(props: RescueMapProps) {
  return <LeafletRescueMap {...props} />;
}

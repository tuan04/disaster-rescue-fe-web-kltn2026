import type { MapPointDetailRes, MapPointRes } from '@/types/mapPoint';
import type { TeamLocation } from '@/types/teamLocation';

import LeafletRescueMap from './leaflet/LeafletRescueMap';

export type RescueMapProps = {
  center: [number, number];
  points: MapPointRes[];
  teamLocations?: TeamLocation[];
  zoom?: number;
  userLocation?: [number, number] | null;
  onPointDetailRequest?: (pointId: string) => void;
  selectedPointDetail?: MapPointDetailRes | null;
  detailLoading?: boolean;
  detailError?: Error | null;
};

export default function RescueMap(props: RescueMapProps) {
  return <LeafletRescueMap {...props} />;
}

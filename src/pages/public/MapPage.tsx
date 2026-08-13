import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import MapLegend from '@/components/map/MapLegend';
import RescueMap from '@/components/map/RescueMap';
import { getAllMapPoints, getMapPointDetail } from '@/services/dispatch';
import type { MapPointDetailRes, MapPointRes } from '@/types/dispatch';

const defaultPosition: [number, number] = [16.059432, 108.223547];

export default function MapPage() {
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);

  const { data } = useQuery<MapPointRes[]>({
    queryKey: ['mapPoints'],
    queryFn: getAllMapPoints,
    refetchInterval: 10000,
    retry: 1,
  });

  const detailQuery = useQuery<MapPointDetailRes, Error>({
    queryKey: ['mapPointDetail', selectedPointId],
    queryFn: () => getMapPointDetail(selectedPointId!),
    enabled: !!selectedPointId,
    retry: 1,
  });

  return (
    <div className="relative w-full h-full bg-slate-100">
      <RescueMap
        center={defaultPosition}
        points={data ?? []}
        zoom={13}
        onPointDetailRequest={setSelectedPointId}
        selectedPointDetail={detailQuery.data ?? null}
        detailLoading={detailQuery.isLoading}
        detailError={detailQuery.error}
      />
      <MapLegend />
    </div>
  );
}

import { get } from '@/services/api';
import type { MapPointRes } from '@/types/dispatch';

export const getAllMapPoints = async (): Promise<MapPointRes[]> => {
    const response = await get<MapPointRes[]>('/v1/map-points');
    return response;
};

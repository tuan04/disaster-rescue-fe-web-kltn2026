import { get } from "@/services/axiosClient";
import type { ApiResponse } from "@/types/response";
import type { TeamLocation } from "@/types/teamLocation";

export const getActiveTeamLocations = async (): Promise<TeamLocation[]> => {
  const response = await get<ApiResponse<TeamLocation[]>>(
    "/v1/campaign-teams/locations-active",
  );
  return response.data;
};

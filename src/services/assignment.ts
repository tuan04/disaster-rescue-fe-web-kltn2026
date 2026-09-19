import { get, post } from "@/services/axiosClient";
import type { ApiResponse } from "@/types/response";
import type {
  AssignmentResponse,
  CampaignTeamNearby,
  RescueAssignmentRequest,
} from "@/types/assignment";

/**
 * Lấy danh sách đội cứu hộ đang hoạt động gần vị trí tọa độ
 * @param latitude Vĩ độ
 * @param longitude Kinh độ
 * @param radiusInMeters Bán kính tìm kiếm (mét)
 */
export const getNearbyCampaignTeams = async (
  latitude: number,
  longitude: number,
  radiusInMeters: number
): Promise<CampaignTeamNearby[]> => {
  const response = await get<ApiResponse<CampaignTeamNearby[]>>(
    "/v1/campaign-teams/nearby",
    {
      params: {
        latitude,
        longitude,
        radiusInMeters,
      },
    }
  );
  return response.data;
};

/**
 * Phân công / điều động các đội cứu hộ cho một yêu cầu cứu nạn
 * @param requestId Mã yêu cầu cứu nạn (UUID)
 * @param assignments Danh sách phân công từng đội
 */
export const assignTeamsToRescueRequest = async (
  requestId: string,
  assignments: RescueAssignmentRequest[]
): Promise<AssignmentResponse[]> => {
  const response = await post<ApiResponse<AssignmentResponse[]>>(
    `/v1/assignments/rescue-requests/${requestId}/assign`,
    assignments
  );
  return response.data;
};

/**
 * Lấy danh sách phân công đội cứu hộ theo mã yêu cầu cứu nạn
 * @param requestId Mã yêu cầu cứu nạn (UUID)
 */
export const getAssignmentsByRequestId = async (
  requestId: string
): Promise<AssignmentResponse[]> => {
  const response = await get<ApiResponse<AssignmentResponse[]>>(
    `/v1/assignments/${requestId}`
  );
  return response.data;
};


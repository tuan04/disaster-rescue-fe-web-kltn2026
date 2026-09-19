export interface CampaignTeamNearby {
  id: string;
  teamName: string;
  leaderId: string;
  leaderPhone: string;
  totalParticipants: number;
  status: string;
  vehicles?: string[];
  createdAt?: string;
  modifiedAt?: string;
}

export interface RescueAssignmentRequest {
  campaignTeamId: string;
  note: string;
  teamName: string;
  leaderPhone: string;
}

export interface AssignmentResponse {
  id: string;
  requestId: string;
  campaignTeamId: string;
  assignedTeamName: string;
  leaderPhone: string;
  status: string;
  assignedAt: string;
  notes?: string;
}

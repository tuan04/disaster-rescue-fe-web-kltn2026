export interface TeamLocation {
  latitude: number;
  longitude: number;
  speed?: number | null;
  heading?: number | null;
  recordedAt: string;
  team_name?: string | null;
  teamName?: string | null;
  leaderPhone?: string | null;
  leaderId?: string | null;
}

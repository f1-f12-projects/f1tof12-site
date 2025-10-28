import { apiService } from './apiService';
import { ProfileStatus } from '../models/ProfileStatus';

let cachedStatuses: ProfileStatus[] | null = null;
let statusToStageMap: Record<string, string> | null = null;

export const profileStatusService = {
  getProfileStatuses: async () => {
    if (cachedStatuses) {
      return cachedStatuses;
    }
    const response = await apiService.get<{success: boolean, message: string, data: ProfileStatus[]}>(process.env.REACT_APP_PROFILE_GET_PROFILE_STATUSES_ENDPOINT!);
    cachedStatuses = response.data;
    return cachedStatuses;
  },

  getStatusToStageMapping: async (): Promise<Record<string, string>> => {
    if (statusToStageMap) {
      return statusToStageMap;
    }
    const statuses = await profileStatusService.getProfileStatuses();
    statusToStageMap = statuses.reduce((map, status) => {
      map[status.status] = status.stage;
      return map;
    }, {} as Record<string, string>);
    return statusToStageMap;
  },

  getStageByStatus: async (status: string): Promise<string | undefined> => {
    const mapping = await profileStatusService.getStatusToStageMapping();
    return mapping[status];
  },

  getStatusList: async (): Promise<string[]> => {
    const statuses = await profileStatusService.getProfileStatuses();
    return statuses.map(status => status.status);
  },

  getStatusById: async (id: number): Promise<string | undefined> => {
    const statuses = await profileStatusService.getProfileStatuses();
    return statuses.find(status => status.id === id)?.status;
  },

  getIdByStatus: async (statusName: string): Promise<number | undefined> => {
    const statuses = await profileStatusService.getProfileStatuses();
    return statuses.find(status => status.status === statusName)?.id;
  },

  getStageById: async (id: number): Promise<string | undefined> => {
    const statuses = await profileStatusService.getProfileStatuses();
    return statuses.find(status => status.id === id)?.stage;
  },

  getStageList: async (): Promise<string[]> => {
    const statuses = await profileStatusService.getProfileStatuses();
    const stages = Array.from(new Set(statuses.map(status => status.stage)));
    return stages;
  },

  getStatusesByStage: async (stageName: string): Promise<string[]> => {
    const statuses = await profileStatusService.getProfileStatuses();
    return statuses.filter(status => status.stage === stageName).map(status => status.status);
  },

};
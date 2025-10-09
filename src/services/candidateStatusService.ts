import { apiService } from './apiService';
import { CandidateStatus } from '../models/CandidateStatus';

let cachedStatuses: CandidateStatus[] | null = null;

export const candidateStatusService = {
  getCandidateStatuses: async () => {
    if (cachedStatuses) {
      return cachedStatuses;
    }
    cachedStatuses = await apiService.get<CandidateStatus[]>(process.env.REACT_APP_PROFILE_GET_CANDIDATE_STATUSES_ENDPOINT!);
    return cachedStatuses;
  }
};
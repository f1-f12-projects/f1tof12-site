import { requirementService } from '../../services/requirementService';
import { RequirementStatus } from '../../models/RequirementStatus';
import { Requirement } from '../../models/Requirement';

export const handleRequirementStatus = async (
  requirementId: number,
  statusId: number,
  handleApiResponse: any,
  updateRequirements: (updater: (prev: Requirement[]) => Requirement[]) => void,
  remarks?: string
) => {
  await handleApiResponse(
    () => requirementService.updateRequirementStatus(requirementId, statusId, remarks),
    () => {
      updateRequirements(prev => prev.map(r => 
        r.requirement_id === requirementId ? { ...r, status_id: statusId, remarks: remarks || r.remarks } : r
      ));
    }
  );
};
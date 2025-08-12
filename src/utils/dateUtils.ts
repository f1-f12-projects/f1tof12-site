export const convertUTCToIST = (utcDateString: string | undefined): string => {
  if (!utcDateString) return 'N/A';
  const utcDate = new Date(utcDateString);
  return new Date(utcDate.getTime() + (5.5 * 60 * 60 * 1000)).toISOString();
};

export const formatDateIST = (dateString: string | undefined): string => {
  if (!dateString) return 'N/A';
  const istDate = convertUTCToIST(dateString);
  return new Date(istDate).toLocaleDateString('en-IN');
};

export const formatDateTimeIST = (dateString: string | undefined): string => {
  if (!dateString) return 'N/A';
  const istDate = convertUTCToIST(dateString);
  return new Date(istDate).toLocaleString('en-IN');
};
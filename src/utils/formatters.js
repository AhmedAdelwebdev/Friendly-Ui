export const getDownloadLink = (link) => {
  if (!link) return '#';
  if (link.includes('drive.google.com')) {
    const match = link.match(/\/d\/(.*?)\//);
    const fileId = match?.[1];
    if (fileId) {
      return `https://drive.google.com/uc?export=download&id=${fileId}`;
    }
  }
  return link;
};

export const formatDate = (dateString) => {
  if (!dateString) return '---';
  return new Date(dateString).toLocaleString("en-US", {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

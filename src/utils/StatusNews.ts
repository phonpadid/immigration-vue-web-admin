export const getStatusColor = (status: any) => {
  switch (status) {
    case "published":
      return "green";
    case "private":
      return "red";
    case "draft":
      return "gray";
    default:
      return "default";
  }
};

export const getStatusText = (status: any) => {
  switch (status) {
    case "published":
      return "ເຜີຍແຜ່";
    case "private":
      return "ສ່ວນໂຕ";
    case "draft":
      return "ແບບຮ່າງ";
    default:
      return status;
  }
};

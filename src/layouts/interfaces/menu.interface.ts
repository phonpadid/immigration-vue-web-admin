export interface ItemType {
  key?: string;
  label?: string;
  icon?: any;
  children?: ItemType[];
  type?: string;
  role?: string[];
  permission?: string;
  onClick?: () => void;
}

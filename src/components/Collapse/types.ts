export interface Panel {
  key: string;
  header: string;
  type: string;
  content?: string;
  [key: string]: any; // For additional properties
}

interface ContentAttrs {
  alt?: string;
  src?: string;
  title?: string | null;
}

interface ContentItem {
  type: string;
  attrs?: ContentAttrs;
}

interface ContentData {
  type: string;
  content: ContentItem[];
}

export interface LanguageContent {
  id: number;
  created_at: string;
  updated_at: string;
  lang_id: number;
  name: string;
  content: ContentData;
}

export interface VisaImage {
  url: string;
  alt: string;
}

export interface VisaPanelData {
  key: string;
  header: string;
  type: string;
  images: VisaImage[];
  imagesLoaded: boolean;
}

export interface VisaTabConfig {
  key: string;
  label: string;
  slotName: string;
  lang: string;
}

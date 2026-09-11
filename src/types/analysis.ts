export interface PlaceInfo {
  name: string;
  address: string | null;
  category: string | null;
  confidence: number;
  mapUrl: string | null;
  phone: string | null;
  businessHours: string | null;
}

export interface ProductInfo {
  name: string;
  brand: string | null;
  price: string | null;
  purchaseUrl: string | null;
  confidence: number;
}

export interface LinkInfo {
  url: string;
  description: string;
}

export interface AnalysisResult {
  id: string;
  postUrl: string;
  summary: string;
  places: PlaceInfo[];
  products: ProductInfo[];
  links: LinkInfo[];
  rawCaption: string | null;
  analyzedAt: string;
  confidence: number;
}

export interface AnalyzeRequest {
  url: string;
}

export interface AnalyzeResponse {
  success: boolean;
  data?: AnalysisResult;
  error?: string;
}

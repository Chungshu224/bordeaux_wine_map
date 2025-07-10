// src/services/types.ts
export interface StrapiResponse<T> {
  data: T;
  meta: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface StrapiImage {
  data: {
    id: number;
    attributes: {
      name: string;
      url: string;
      alternativeText?: string;
      caption?: string;
      width: number;
      height: number;
      formats?: {
        thumbnail?: { url: string; width: number; height: number };
        small?: { url: string; width: number; height: number };
        medium?: { url: string; width: number; height: number };
        large?: { url: string; width: number; height: number };
      };
    };
  };
}

export interface StrapiImageArray {
  data: Array<{
    id: number;
    attributes: {
      name: string;
      url: string;
      alternativeText?: string;
      caption?: string;
      width: number;
      height: number;
    };
  }>;
}

export interface AOCAttributes {
  name: string;
  nameEn: string;
  nameZh: string;
  slug: string;
  region: string;
  subRegion: string;
  description: string;
  history?: string;
  terroir?: string;
  area: number;
  established: number;
  wineTypes: string[];
  grapeVarieties: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  locale: string;
  image?: StrapiImage;
  gallery?: StrapiImageArray;
}

export interface AOC {
  id: number;
  attributes: AOCAttributes;
}

export interface AOCFilters {
  region?: string;
  subRegion?: string;
  isActive?: boolean;
  slug?: string;
  // 添加搜尋支援
  $or?: Array<{
    name?: { $containsi?: string };
    nameEn?: { $containsi?: string };
    nameZh?: { $containsi?: string };
  }>;
}

export interface AOCQueryParams {
  populate?: string;
  filters?: AOCFilters;
  sort?: string;
  pagination?: {
    page: number;
    pageSize: number;
  };
  locale?: string;
}

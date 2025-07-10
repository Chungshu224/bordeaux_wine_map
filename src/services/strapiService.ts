// src/services/strapiService.ts (修正版)
import type {
  StrapiResponse,
  AOC,
  AOCQueryParams,
  AOCFilters
} from './types';

class StrapiService {
  private readonly baseUrl = import.meta.env.VITE_STRAPI_URL || 'http://localhost:1337/api';


   /**
   * 通用 fetch 方法 (增強錯誤處理)
   */
  private async fetchFromStrapi<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<StrapiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    console.log('🔍 發送請求到:', url);

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options.headers,
        },
        signal: AbortSignal.timeout(15000), // 增加超時時間
        ...options,
      });

      console.log('📡 回應狀態:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API 錯誤回應:', errorText);

        // 提供更詳細的錯誤訊息
        switch (response.status) {
          case 426:
            throw new Error('Strapi 服務器要求協議升級 - 請檢查 Strapi 是否正確運行在 http://localhost:1337');
          case 404:
            throw new Error(`資源不存在: ${endpoint}`);
          case 403:
            throw new Error('權限不足，請檢查 Strapi 權限設定');
          case 500:
            throw new Error('Strapi 伺服器錯誤');
          default:
            throw new Error(`Strapi API 錯誤: ${response.status} - ${response.statusText}`);
        }
      }

      const data = await response.json();
      console.log('✅ API 回應成功:', data);
      return data;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'TimeoutError') {
          throw new Error('請求超時，請檢查 Strapi 服務是否正常運行');
        }
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
          throw new Error('無法連接到 Strapi 服務器，請確認服務是否在 http://localhost:1337 運行');
        }
      }
      console.error('❌ Strapi API 請求失敗:', error);
      throw error;
    }
  }

   /**
   * 建立查詢參數字串 (修正版)
   */
  private buildQueryString(params: AOCQueryParams): string {
    const searchParams = new URLSearchParams();

    console.log('🔧 建構查詢參數:', params);

    if (params.populate) {
      searchParams.append('populate', params.populate);
    }

    if (params.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          // 處理特殊的 $or 操作符
          if (key === '$or' && Array.isArray(value)) {
            value.forEach((orCondition, index) => {
              Object.entries(orCondition).forEach(([field, condition]) => {
                if (condition && typeof condition === 'object' && '$containsi' in condition) {
                  searchParams.append(
                    `filters[$or][${index}][${field}][$containsi]`,
                    condition.$containsi as string
                  );
                }
              });
            });
          } else {
            // 一般的過濾條件
            const stringValue = typeof value === 'string' ? value : String(value);
            searchParams.append(`filters[${key}][$eq]`, stringValue);
          }
        }
      });
    }

    if (params.sort) {
      searchParams.append('sort', params.sort);
    }

    if (params.pagination) {
      searchParams.append('pagination[page]', params.pagination.page.toString());
      searchParams.append('pagination[pageSize]', params.pagination.pageSize.toString());
    }

    if (params.locale) {
      searchParams.append('locale', params.locale);
    }

    const queryString = searchParams.toString();
    console.log('🔗 最終查詢字串:', queryString);
    return queryString;
  }

  /**
   * 獲取所有 AOC (修正版)
   */
  async getAllAOCs(params: AOCQueryParams = {}): Promise<AOC[]> {
    try {
      const queryString = this.buildQueryString(params);
      const endpoint = `/aocs${queryString ? `?${queryString}` : ''}`;

      const response = await this.fetchFromStrapi<AOC[]>(endpoint);
      return response.data;
    } catch (error) {
      console.error('❌ getAllAOCs 失敗:', error);
      throw error;
    }
  }

  /**
   * 根據 slug 獲取 AOC (修正版)
   */
  async getAOCBySlug(slug: string, populate = '*'): Promise<AOC | null> {
    try {
      const filters: AOCFilters = { slug }; // 使用正確型別
      const queryString = this.buildQueryString({
        filters,
        populate,
      });

      const endpoint = `/aocs?${queryString}`;
      const response = await this.fetchFromStrapi<AOC[]>(endpoint);
      return response.data.length > 0 ? response.data[0] : null;
    } catch (error) {
      console.error('❌ getAOCBySlug 失敗:', error);
      throw error;
    }
  }

 /**
   * 改進的健康檢查
   */
  async healthCheck(): Promise<boolean> {
    try {
      console.log('🔍 執行健康檢查...');

      // 先測試基本 Strapi 根路徑
      const baseResponse = await fetch('http://localhost:1337', {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });

      console.log('基本連接狀態:', baseResponse.status);

      if (!baseResponse.ok) {
        console.warn('⚠️ 基本連接失敗，嘗試 API 端點...');
      }

      // 測試 API 端點
      const apiResponse = await fetch('http://localhost:1337/api', {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        signal: AbortSignal.timeout(5000)
      });

      console.log('API 端點狀態:', apiResponse.status);
      return apiResponse.ok;

    } catch (error) {
      console.error('❌ 健康檢查失敗:', error);
      return false;
    }
  }

/**
   * 詳細的連接診斷
   */
  async diagnosticConnection(): Promise<void> {
    console.log('=== 🔧 Strapi 連接診斷 ===');

    // 測試 1: 基本 Strapi 連接
    try {
      console.log('📡 測試 1: 基本 Strapi 連接');
      const response = await fetch('http://localhost:1337', {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      console.log('✅ 基本連接狀態:', response.status, response.statusText);
    } catch (error) {
      console.error('❌ 基本連接失敗:', error);
      console.log('💡 建議: 請確認 Strapi 正在運行');
      return;
    }

    // 測試 2: API 端點
    try {
      console.log('📡 測試 2: API 端點');
      const response = await fetch('http://localhost:1337/api', {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(5000)
      });
      console.log('✅ API 端點狀態:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('📄 API 資訊:', data);
      }
    } catch (error) {
      console.error('❌ API 端點測試失敗:', error);
    }

    // 測試 3: AOC 端點
    try {
      console.log('📡 測試 3: AOC 端點');
      const response = await fetch('http://localhost:1337/api/aocs', {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(5000)
      });
      console.log('✅ AOC 端點狀態:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('📊 AOC 資料:', data);
      } else {
        console.log('⚠️ AOC 端點問題，狀態:', response.status);
      }
    } catch (error) {
      console.error('❌ AOC 端點測試失敗:', error);
    }

    console.log('=== 🏁 診斷完成 ===');
  }

  /**
   * 簡單測試 API 連接
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        signal: AbortSignal.timeout(10000)
      });

      console.log('測試連接狀態:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('API 回應:', data);
        return true;
      } else {
        const errorText = await response.text();
        console.error('連接測試失敗:', errorText);
        return false;
      }
    } catch (error) {
      console.error('連接測試異常:', error);
      return false;
    }
  }

 /**
   * 根據 ID 獲取 AOC
   */
  async getAOCById(id: number, populate = '*'): Promise<AOC | null> {
    try {
      const endpoint = `/aocs/${id}${populate ? `?populate=${populate}` : ''}`;
      const response = await this.fetchFromStrapi<AOC>(endpoint);
      return response.data;
    } catch (error) {
      console.error('❌ getAOCById 失敗:', error);
      throw error;
    }
  }

  /**
   * 搜尋 AOC (使用簡單的查詢)
   */
  async searchAOCs(query: string, populate = '*'): Promise<AOC[]> {
    try {
      // 使用簡單的名稱搜尋，避免複雜的 $or 查詢
      const searchParams = new URLSearchParams();
      searchParams.append('populate', populate);
      searchParams.append('filters[name][$containsi]', query);

      const endpoint = `/aocs?${searchParams.toString()}`;
      const response = await this.fetchFromStrapi<AOC[]>(endpoint);
      return response.data;
    } catch (error) {
      console.error('❌ searchAOCs 失敗:', error);

      // 如果搜尋失敗，嘗試獲取所有 AOC 並在前端過濾
      try {
        const allAOCs = await this.getAllAOCs({ populate });
        return allAOCs.filter(aoc =>
          aoc.attributes.name.toLowerCase().includes(query.toLowerCase()) ||
          aoc.attributes.nameEn?.toLowerCase().includes(query.toLowerCase()) ||
          aoc.attributes.nameZh?.toLowerCase().includes(query.toLowerCase())
        );
      } catch (fallbackError) {
        console.error('❌ 搜尋備用方案也失敗:', fallbackError);
        throw error;
      }
    }
  }
}

export const strapiService = new StrapiService();
export default strapiService;

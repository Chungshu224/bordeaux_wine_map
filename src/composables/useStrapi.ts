// src/composables/useStrapi.ts
import { ref, computed } from 'vue';
import { strapiService } from '@/services/strapiService';
import type { AOC, AOCQueryParams } from '@/services/types';

export function useAOCs() {
  const aocs = ref<AOC[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  /**
   * 載入所有 AOC
   */
  const loadAOCs = async (params: AOCQueryParams = {}) => {
    loading.value = true;
    error.value = null;

    try {
      const defaultParams: AOCQueryParams = {
        populate: '*',
        sort: 'name:asc',
        locale: 'zh-TW',
        ...params,
      };

      const result = await strapiService.getAllAOCs(defaultParams);
      aocs.value = result;
    } catch (err) {
      error.value = err instanceof Error ? err.message : '載入 AOC 資料失敗';
      console.error('載入 AOC 失敗:', err);
    } finally {
      loading.value = false;
    }
  };

  /**
   * 按區域分組的 AOC
   */
  const groupedAOCs = computed(() => {
    const groups: Record<string, AOC[]> = {};

    aocs.value.forEach(aoc => {
      const region = aoc.attributes.region;
      if (!groups[region]) {
        groups[region] = [];
      }
      groups[region].push(aoc);
    });

    return groups;
  });

  /**
   * 根據 ID 獲取 AOC
   */
  const getAOCById = async (id: number, populate = '*'): Promise<AOC | null> => {
    try {
      const endpoint = `/aocs/${id}${populate ? `?populate=${populate}` : ''}`;
      // You may need to replace 'this.fetchFromStrapi' with the correct service call, e.g. strapiService.getAOCById
      // const response = await this.fetchFromStrapi<AOC>(endpoint);
      const response = await strapiService.getAOCById(id, populate);
      return response;
    } catch (error) {
      console.error('❌ getAOCById 失敗:', error);
      throw error;
    }
  };

 /**
   * 搜尋 AOC
   */
  const searchAOCs = async (query: string): Promise<AOC[]> => {
    if (!query.trim()) {
      return aocs.value;
    }

    loading.value = true;
    error.value = null;

    try {
      // 使用 strapiService 的 searchAOCs 方法而不是複雜的參數
      const result = await strapiService.searchAOCs(query);
      return result;
    } catch (err) {
      error.value = err instanceof Error ? err.message : '搜尋失敗';
      console.error('搜尋 AOC 失敗:', err);
      return [];
    } finally {
      loading.value = false;
    }
  };

  /**
   * 重置狀態
   */
  const resetState = () => {
    aocs.value = [];
    loading.value = false;
    error.value = null;
  };

  return {
    aocs,
    loading,
    error,
    groupedAOCs,
    loadAOCs,
    getAOCById,
    searchAOCs,
    resetState,
  };
}

export function useAOC(id: number | null) {
  const aoc = ref<AOC | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const loadAOC = async () => {
    if (!id) return;

    loading.value = true;
    error.value = null;

    try {
      const result = await strapiService.getAOCById(id);
      aoc.value = result;
    } catch (err) {
      error.value = err instanceof Error ? err.message : '載入 AOC 詳細資料失敗';
      console.error('載入 AOC 詳細資料失敗:', err);
    } finally {
      loading.value = false;
    }
  };

  return {
    aoc,
    loading,
    error,
    loadAOC,
  };
}

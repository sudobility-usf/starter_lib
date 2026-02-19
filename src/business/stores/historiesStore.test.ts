import { describe, it, expect, beforeEach } from 'vitest';
import { useHistoriesStore } from './historiesStore';
import type { History } from '@sudobility/starter_types';

const makeHistory = (overrides: Partial<History> = {}): History => ({
  id: 'hist-1',
  user_id: 'user-1',
  datetime: '2024-01-01T00:00:00Z',
  value: 100,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

describe('historiesStore', () => {
  beforeEach(() => {
    useHistoriesStore.getState().clearAll();
  });

  describe('setHistories', () => {
    it('should set histories for a user', () => {
      const histories = [makeHistory(), makeHistory({ id: 'hist-2' })];
      useHistoriesStore.getState().setHistories('user-1', histories);
      const result = useHistoriesStore.getState().getHistories('user-1');
      expect(result).toHaveLength(2);
    });

    it('should overwrite existing histories', () => {
      useHistoriesStore.getState().setHistories('user-1', [makeHistory()]);
      useHistoriesStore
        .getState()
        .setHistories('user-1', [makeHistory({ id: 'hist-new' })]);
      const result = useHistoriesStore.getState().getHistories('user-1');
      expect(result).toHaveLength(1);
      expect(result![0].id).toBe('hist-new');
    });

    it('should not affect other users', () => {
      useHistoriesStore.getState().setHistories('user-1', [makeHistory()]);
      useHistoriesStore
        .getState()
        .setHistories('user-2', [
          makeHistory({ id: 'hist-2', user_id: 'user-2' }),
        ]);
      expect(useHistoriesStore.getState().getHistories('user-1')).toHaveLength(
        1
      );
      expect(useHistoriesStore.getState().getHistories('user-2')).toHaveLength(
        1
      );
    });
  });

  describe('getHistories', () => {
    it('should return undefined for unknown user', () => {
      const result = useHistoriesStore.getState().getHistories('unknown');
      expect(result).toBeUndefined();
    });

    it('should return histories for known user', () => {
      useHistoriesStore.getState().setHistories('user-1', [makeHistory()]);
      const result = useHistoriesStore.getState().getHistories('user-1');
      expect(result).toHaveLength(1);
      expect(result![0].id).toBe('hist-1');
    });
  });

  describe('getCacheEntry', () => {
    it('should return undefined for unknown user', () => {
      const entry = useHistoriesStore.getState().getCacheEntry('unknown');
      expect(entry).toBeUndefined();
    });

    it('should return cache entry with cachedAt timestamp', () => {
      useHistoriesStore.getState().setHistories('user-1', [makeHistory()]);
      const entry = useHistoriesStore.getState().getCacheEntry('user-1');
      expect(entry).toBeDefined();
      expect(entry!.histories).toHaveLength(1);
      expect(entry!.cachedAt).toBeGreaterThan(0);
    });
  });

  describe('addHistory', () => {
    it('should add to existing histories', () => {
      useHistoriesStore.getState().setHistories('user-1', [makeHistory()]);
      useHistoriesStore
        .getState()
        .addHistory('user-1', makeHistory({ id: 'hist-2', value: 200 }));
      const result = useHistoriesStore.getState().getHistories('user-1');
      expect(result).toHaveLength(2);
      expect(result![1].id).toBe('hist-2');
    });

    it('should create cache entry if none exists', () => {
      useHistoriesStore
        .getState()
        .addHistory('user-1', makeHistory({ id: 'hist-1' }));
      const result = useHistoriesStore.getState().getHistories('user-1');
      expect(result).toHaveLength(1);
    });
  });

  describe('updateHistory', () => {
    it('should update existing history by id', () => {
      useHistoriesStore.getState().setHistories('user-1', [makeHistory()]);
      useHistoriesStore
        .getState()
        .updateHistory(
          'user-1',
          'hist-1',
          makeHistory({ id: 'hist-1', value: 999 })
        );
      const result = useHistoriesStore.getState().getHistories('user-1');
      expect(result![0].value).toBe(999);
    });

    it('should not modify other histories', () => {
      useHistoriesStore
        .getState()
        .setHistories('user-1', [
          makeHistory(),
          makeHistory({ id: 'hist-2', value: 200 }),
        ]);
      useHistoriesStore
        .getState()
        .updateHistory(
          'user-1',
          'hist-1',
          makeHistory({ id: 'hist-1', value: 999 })
        );
      const result = useHistoriesStore.getState().getHistories('user-1');
      expect(result![1].value).toBe(200);
    });

    it('should do nothing if user has no cache', () => {
      useHistoriesStore
        .getState()
        .updateHistory('unknown', 'hist-1', makeHistory());
      const result = useHistoriesStore.getState().getHistories('unknown');
      expect(result).toBeUndefined();
    });
  });

  describe('removeHistory', () => {
    it('should remove history by id', () => {
      useHistoriesStore
        .getState()
        .setHistories('user-1', [
          makeHistory(),
          makeHistory({ id: 'hist-2' }),
        ]);
      useHistoriesStore.getState().removeHistory('user-1', 'hist-1');
      const result = useHistoriesStore.getState().getHistories('user-1');
      expect(result).toHaveLength(1);
      expect(result![0].id).toBe('hist-2');
    });

    it('should do nothing if user has no cache', () => {
      useHistoriesStore.getState().removeHistory('unknown', 'hist-1');
      const result = useHistoriesStore.getState().getHistories('unknown');
      expect(result).toBeUndefined();
    });
  });

  describe('clearAll', () => {
    it('should clear all cached data', () => {
      useHistoriesStore.getState().setHistories('user-1', [makeHistory()]);
      useHistoriesStore
        .getState()
        .setHistories('user-2', [
          makeHistory({ id: 'hist-2', user_id: 'user-2' }),
        ]);
      useHistoriesStore.getState().clearAll();
      expect(useHistoriesStore.getState().getHistories('user-1')).toBeUndefined();
      expect(useHistoriesStore.getState().getHistories('user-2')).toBeUndefined();
    });
  });
});

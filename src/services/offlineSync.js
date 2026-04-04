import api from './api';

const OFFLINE_QUEUE_KEY = 'thabat_offline_queue';

/**
 * offlineSync: A service to manage offline action storage and background synchronization.
 */
export const queueOfflineAction = (type, data) => {
  const currentQueue = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
  currentQueue.push({ type, data, timestamp: Date.now() });
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(currentQueue));
};

export const syncOfflineActions = async () => {
  if (!navigator.onLine) return; // Still offline

  const currentQueue = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
  if (currentQueue.length === 0) return;

  console.log('🔄 Syncing offline actions...', currentQueue.length);

  const newQueue = [];
  for (const action of currentQueue) {
    try {
      if (action.type === 'UPDATE_PROGRESS') {
        await api.post('/progress/update', action.data);
      } else if (action.type === 'TOGGLE_SUNNAH') {
        await api.put('/progress/toggle-sunnah');
      }
      // Action synced successfully, skip adding to newQueue
    } catch (error) {
      console.error('❌ Failed to sync action, re-queueing:', error);
      newQueue.push(action);
    }
  }

  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(newQueue));
};

// Auto-sync when the browser comes back online
if (typeof window !== 'undefined') {
  window.addEventListener('online', syncOfflineActions);
}

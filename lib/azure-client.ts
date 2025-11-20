/**
 * Mock Azure client for compatibility
 * Replaces actual Azure API client with mock responses for demo mode
 */

'use client';

// Mock Azure client that returns demo data
export const azureClient = {
  get: async (_url: string) => {
    console.log('🎭 Mock Azure GET - Demo mode');
    return { success: false, data: null, error: 'Demo mode - feature not available' };
  },

  post: async (_url: string, _data?: any) => {
    console.log('🎭 Mock Azure POST - Demo mode');
    return { success: false, data: null, error: 'Demo mode - feature not available' };
  },

  put: async (_url: string, _data?: any) => {
    console.log('🎭 Mock Azure PUT - Demo mode');
    return { success: false, data: null, error: 'Demo mode - feature not available' };
  },

  delete: async (_url: string) => {
    console.log('🎭 Mock Azure DELETE - Demo mode');
    return { success: false, data: null, error: 'Demo mode - feature not available' };
  }
};

export default azureClient;

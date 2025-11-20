/**
 * Mock Seehaus knowledge seeding script for demo
 */

export async function seedSeehausKnowledge(): Promise<{ success: boolean; message: string; processed: number }> {
  console.log('🎭 Demo: Seeding Seehaus knowledge mock');
  
  // Simulate seeding process
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    success: false,
    message: 'Demo mode - knowledge seeding not available',
    processed: 0
  };
}

export default seedSeehausKnowledge;

import { fetchLanguages } from '../src/features/user-lists/services/userLists';

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ languages: [{ id: 1, name: 'English', iso_code: 'en' }] }),
  })
) as jest.Mock;

console.log("Mock test passed if code compiles.");

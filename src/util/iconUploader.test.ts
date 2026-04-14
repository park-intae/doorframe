import { vi, describe, it, expect, beforeEach } from 'vitest';
import { uploadFavicon } from './iconUploader';
import { supabase } from '@/config/supabase';

// Supabase 모킹
vi.mock('@/config/supabase', () => ({
    supabase: {
        supabaseUrl: 'https://test.supabase.co',
        functions: { invoke: vi.fn() },
        storage: { from: vi.fn(() => ({ upload: vi.fn(), getPublicUrl: vi.fn() })) },
        auth: { getSession: vi.fn() }
    }
}));

// 2. fetch 모킹
vi.stubGlobal('fetch', vi.fn());

describe('uploadFavicon 테스트', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('파비콘 업로드 성공 시 공개 URL을 반환해야 함', async () => {
        // 모킹 설정
        (global.fetch as any).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ base64: 'dGVzdA==', contentType: 'image/x-icon' })
        });
        (supabase.auth.getSession as any).mockResolvedValue({ data: { session: { user: { id: 'test_user' } } } });
        
        const mockUpload = vi.fn().mockResolvedValue({ error: null });
        const mockGetPublicUrl = vi.fn().mockReturnValue({ data: { publicUrl: 'http://test.com/test.ico' } });
        
        (supabase.storage.from as any).mockReturnValue({ 
            upload: mockUpload, 
            getPublicUrl: mockGetPublicUrl 
        });

        const result = await uploadFavicon('https://test.com');
        
        expect(result).toBe('http://test.com/test.ico');
        expect(global.fetch).toHaveBeenCalled();
        expect(mockUpload).toHaveBeenCalled();
    });
});

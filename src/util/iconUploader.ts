import { supabase } from "@/config/supabase";

/**
 * 외부 파비콘 URL을 가져와 Supabase Storage에 업로드하고 공개 URL을 반환합니다.
 */
export async function uploadFavicon(urlString: string): Promise<string> {
    const defaultIcon = '/note.svg';

    try {
        const urlObj = new URL(urlString);
        const faviconUrl = `${urlObj.origin}/favicon.ico`;

        // 1. 외부 아이콘 fetch
        const response = await fetch(faviconUrl);
        if (!response.ok) throw new Error('Failed to fetch favicon');
        const blob = await response.blob();

        // 2. Storage에 업로드 (이미지 파일명은 도메인 기반으로 고유하게 생성)
        const fileName = `${urlObj.hostname}.ico`;
        const { data, error } = await supabase.storage
            .from('bookmarks') // 'bookmarks' 버킷이 미리 생성되어 있어야 함
            .upload(fileName, blob, {
                upsert: true,
                contentType: 'image/x-icon',
            });

        if (error) throw error;

        // 3. 공개 URL 획득
        const { data: publicUrlData } = supabase.storage
            .from('bookmarks')
            .getPublicUrl(fileName);

        return publicUrlData.publicUrl;
    } catch (e) {
        console.error('아이콘 업로드 실패, 기본 아이콘 사용:', e);
        return defaultIcon;
    }
}

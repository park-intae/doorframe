import { supabase } from "@/config/supabase";

/**
 * 외부 파비콘 URL을 가져와 Supabase Storage에 업로드하고 공개 URL을 반환합니다.
 */
export async function uploadFavicon(urlString: string): Promise<string> {
    const defaultIcon = `${import.meta.env.BASE_URL}images/internet.svg`;

    try {
        const urlObj = new URL(urlString);
        const targetFaviconUrl = `${urlObj.origin}/favicon.ico`;

        // 1. Edge Function을 통해 파비콘 프록시 호출
        const response = await fetch(`${supabase.supabaseUrl}/functions/v1/favicon-proxy`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({ url: targetFaviconUrl }),
        });

        const proxyData = await response.json();
        if (!response.ok) throw new Error(proxyData.error || 'Failed to fetch favicon');

        // 세션에서 사용자 ID 가져오기
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user.id || 'anonymous';

        // Base64 문자열을 Blob으로 변환
        const byteCharacters = atob(proxyData.base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const blob = new Blob([new Uint8Array(byteNumbers)], { type: proxyData.contentType });

        // 2. Storage에 업로드 (유저 ID별 폴더 구조)
        const fileName = `${userId}/${urlObj.hostname}.ico`;
        const { error: uploadError } = await supabase.storage
            .from('bookmarks')
            .upload(fileName, blob, {
                upsert: true,
                contentType: proxyData.contentType,
            });

        if (uploadError) throw uploadError;

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

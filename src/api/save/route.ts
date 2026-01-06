// 이거 나중에 배포할 때 서버에 저장하는 식으로 써먹으려고 쓴 듯? 그때 쓰셈 ㅇㅇ
import { mkdir, writeFile } from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const dir = path.join(process.cwd(), 'tmp');
    const filePath = path.join(dir, 'data.json');

    await mkdir(dir, { recursive: true });
    await writeFile(filePath, JSON.stringify(data, null, 2));

    return NextResponse.json({ success: true, path: filePath });
  } catch (err) {
    console.error('저장 실패: ', err);
    return NextResponse.json({ success: false, error: err }, { status: 500 });
  }
}

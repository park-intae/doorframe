'use client';

import { RecoilRoot } from 'recoil';
import { ReactNode } from 'react';

export default function RecoilProvider({ children }: { children: React.ReactNode }) {
  return <RecoilRoot>{children}</RecoilRoot>;
}
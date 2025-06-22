'use client'

import dynamic from "next/dynamic"

const Today = dynamic(() => import('@/component/container/subcomponents/today'), { ssr: false, loading: () => <p>Loading...</p>, });

export default function TodayClient() {
    return <Today />
}
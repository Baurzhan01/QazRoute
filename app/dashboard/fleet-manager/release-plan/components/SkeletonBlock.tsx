export default function SkeletonBlock({ height = 100 }: { height?: number }) {
    return <div className="bg-gray-100 animate-pulse rounded-md" style={{ height }} />
  }
  
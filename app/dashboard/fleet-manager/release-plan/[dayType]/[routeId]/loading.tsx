export default function Loading() {
  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div className="flex items-center gap-2">
        <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse"></div>
        <div className="h-8 w-64 bg-gray-200 animate-pulse rounded"></div>
      </div>
      <div className="h-60 bg-gray-200 animate-pulse rounded-lg mt-4"></div>
    </div>
  )
}


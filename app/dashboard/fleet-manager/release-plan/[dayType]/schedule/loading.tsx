export default function Loading() {
  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div className="flex items-center gap-2">
        <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse"></div>
        <div className="h-8 w-64 bg-gray-200 animate-pulse rounded"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-lg bg-gray-200 animate-pulse" key={i}></div>
        ))}
      </div>
      <div className="h-96 bg-gray-200 animate-pulse rounded-lg"></div>
    </div>
  )
}


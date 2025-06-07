interface SelectableListProps<T> {
  items: T[]
  selectedItem: T | null
  onSelect: (item: T) => void
  labelFn: (item: T) => string
  filterFn: (item: T) => boolean
}

export default function SelectableList<T>({
  items,
  selectedItem,
  onSelect,
  labelFn,
  filterFn,
}: SelectableListProps<T>) {
  return (
    <div className="mt-2 border rounded-lg overflow-y-auto max-h-[300px]">
      {items.filter(filterFn).map((item, index) => (
        <div
          key={index}
          onClick={() => onSelect(item)}
          className={`p-2 cursor-pointer hover:bg-gray-100 ${
            selectedItem === item ? "bg-blue-100" : ""
          }`}
        >
          {labelFn(item)}
        </div>
      ))}
    </div>
  )
} 
import { Search } from "lucide-react"
import { LoadingSpinner } from "./loading-spinner"

export function SearchLoading() {
  return (
    <div className="flex items-center justify-center py-12 space-x-3 rtl:space-x-reverse">
      <Search className="h-5 w-5 text-muted-foreground" />
      <LoadingSpinner size="sm" className="text-primary" />
      <span className="text-muted-foreground">מחפש מתכונים...</span>
    </div>
  )
}

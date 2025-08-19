import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="h-4 bg-muted rounded w-20 animate-pulse"></div>
      </CardHeader>
      <CardContent>
        <div className="h-8 bg-muted rounded w-16 animate-pulse"></div>
      </CardContent>
    </Card>
  )
}

export function PlayerSummarySkeleton() {
  return (
    <div className="mb-8">
      <div className="h-9 bg-muted rounded w-48 mb-6 animate-pulse"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <div className="h-4 bg-muted rounded w-32 animate-pulse"></div>
          </CardHeader>
          <CardContent>
            <div className="h-8 bg-muted rounded w-64 animate-pulse"></div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export function GameTableSkeleton() {
  return (
    <div>
      <div className="h-9 bg-muted rounded w-64 mb-6 animate-pulse"></div>

      {/* Filters skeleton */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="h-10 bg-muted rounded w-32 animate-pulse"></div>
        <div className="h-10 bg-muted rounded w-32 animate-pulse"></div>
        <div className="h-10 bg-muted rounded w-40 animate-pulse"></div>
        <div className="h-10 bg-muted rounded w-64 animate-pulse"></div>
      </div>

      {/* Table skeleton */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4">
                  <div className="h-4 bg-muted rounded w-12 animate-pulse"></div>
                </th>
                <th className="text-left p-4">
                  <div className="h-4 bg-muted rounded w-16 animate-pulse"></div>
                </th>
                <th className="text-left p-4">
                  <div className="h-4 bg-muted rounded w-12 animate-pulse"></div>
                </th>
                <th className="text-left p-4">
                  <div className="h-4 bg-muted rounded w-12 animate-pulse"></div>
                </th>
                <th className="text-left p-4">
                  <div className="h-4 bg-muted rounded w-10 animate-pulse"></div>
                </th>
                <th className="text-left p-4">
                  <div className="h-4 bg-muted rounded w-20 animate-pulse"></div>
                </th>
                <th className="text-left p-4">
                  <div className="h-4 bg-muted rounded w-16 animate-pulse"></div>
                </th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 10 }).map((_, i) => (
                <tr key={i} className="border-b">
                  <td className="p-4">
                    <div className="h-4 bg-muted rounded w-20 animate-pulse"></div>
                  </td>
                  <td className="p-4">
                    <div className="h-4 bg-muted rounded w-24 animate-pulse"></div>
                  </td>
                  <td className="p-4">
                    <div className="h-4 bg-muted rounded w-12 animate-pulse"></div>
                  </td>
                  <td className="p-4">
                    <div className="h-6 bg-muted rounded w-12 animate-pulse"></div>
                  </td>
                  <td className="p-4">
                    <div className="h-6 bg-muted rounded-full w-14 animate-pulse"></div>
                  </td>
                  <td className="p-4">
                    <div className="h-4 bg-muted rounded w-12 animate-pulse"></div>
                  </td>
                  <td className="p-4">
                    <div className="h-4 bg-muted rounded w-32 animate-pulse"></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"

import data from "./data.json"

export default function Page() {
  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <h2 className="text-2xl font-bold tracking-tight">Welcome back, User! 👋</h2>
          <p className="text-muted-foreground">Here is what's happening with your language learning today.</p>
        </div>
        <SectionCards />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 lg:px-6">
          {/* Featured Card */}
          <div className="md:col-span-2">
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm h-[300px] flex items-center justify-center p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-primary/10"></div>
              <div className="relative z-10 text-center">
                <h3 className="text-2xl font-bold mb-2">Continue Learning Spanish</h3>
                <p className="mb-4 text-muted-foreground">Pick up where you left off in Chapter 3.</p>
                <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md">Continue Lesson</button>
              </div>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 gap-4">
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-4 flex flex-col justify-center items-center h-full hover:bg-accent cursor-pointer transition-colors">
              <span className="font-semibold">Quick Conjugate</span>
            </div>
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-4 flex flex-col justify-center items-center h-full hover:bg-accent cursor-pointer transition-colors">
              <span className="font-semibold">Daily Quiz</span>
            </div>
          </div>
        </div>

        <div className="px-4 lg:px-6">
          <h3 className="text-lg font-semibold mb-4">Activity History</h3>
          <ChartAreaInteractive />
        </div>
        <DataTable data={data} />
      </div>
    </div>
  )
}

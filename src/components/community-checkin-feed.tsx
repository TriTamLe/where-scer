import { usePaginatedQuery } from 'convex/react'
import { LoaderCircle, MapPinned, UsersRound } from 'lucide-react'
import { useEffect, useRef } from 'react'

import { Button } from '#/components/ui/button.tsx'
import { useLocationLabels } from '#/hooks/use-location-labels.ts'
import { api } from '../../convex/_generated/api'

type FeedStatus =
  'CanLoadMore' | 'Exhausted' | 'LoadingFirstPage' | 'LoadingMore'

const GROUPS = [
  ['country', 'Quốc gia'],
  ['province', 'Việt Nam'],
  ['ward', 'Đà Nẵng']
] as const

function CommunityCheckinFeed({ code }: { code: string }) {
  const { isLoading, loadMore, results, status } = usePaginatedQuery(
    api.checkins.communityFeed,
    { code },
    { initialNumItems: 20 }
  )
  const labelFor = useLocationLabels()
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || status !== 'CanLoadMore') return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) loadMore(20)
      },
      { rootMargin: '240px 0px' }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [loadMore, status])

  return (
    <aside
      aria-label="SC-ers đã check-in"
      className="community-feed soft-panel flex flex-col overflow-hidden"
    >
      <div className="border-b border-divider bg-secondary-soft px-4 py-5 sm:px-5">
        <div className="flex items-center gap-3">
          <div
            aria-hidden="true"
            className="grid size-10 shrink-0 place-items-center rounded-[45%_55%_48%_52%] border border-secondary-strong bg-secondary text-white shadow-[0_4px_0_var(--secondary-strong)]"
          >
            <UsersRound className="size-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold">Cả nhà đã check-in</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Mỗi SC-er và những nơi họ đã ghé qua.
            </p>
          </div>
        </div>
      </div>

      <div className="min-h-0 overflow-y-auto px-3 py-3 sm:px-4">
        {isLoading && results.length === 0 ? <FeedSkeleton /> : null}
        {!isLoading && results.length === 0 ? <FeedEmpty /> : null}
        <ul className="space-y-2" aria-live="polite">
          {results.map((person) => (
            <CommunityPersonCard
              key={person.publicId || person.nickname}
              labelFor={labelFor}
              person={person}
            />
          ))}
        </ul>
        <div ref={sentinelRef} aria-hidden="true" className="h-px" />
        <FeedMore status={status} onLoadMore={() => loadMore(20)} />
      </div>
    </aside>
  )
}

function CommunityPersonCard({
  labelFor,
  person
}: {
  labelFor: ReturnType<typeof useLocationLabels>
  person: {
    checkins: Array<{ code: string; type: 'country' | 'province' | 'ward' }>
    isCurrentUser: boolean
    nickname: string
    publicId: string
  }
}) {
  return (
    <li
      className="rounded-[var(--radius-card)] border border-divider bg-card p-3 transition-[background-color,border-color,box-shadow,transform] duration-[var(--dur-standard)] ease-out hover:border-secondary-muted hover:bg-secondary-soft hover:shadow-[var(--shadow-soft)] hover:-translate-y-0.5"
      data-interactive="true"
    >
      <div className="flex min-w-0 items-center gap-3">
        <div
          aria-hidden="true"
          className="grid size-9 shrink-0 place-items-center rounded-[45%_55%_48%_52%] bg-primary-soft text-secondary-strong"
        >
          <MapPinned className="size-4" />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate font-semibold">{person.nickname}</h3>
            {person.isCurrentUser ? (
              <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground shadow-[0_2px_0_var(--primary-strong)]">
                Bạn
              </span>
            ) : null}
          </div>
          {person.publicId ? (
            <p className="mt-0.5 font-mono text-xs text-muted-foreground">
              {person.publicId}
            </p>
          ) : null}
        </div>
      </div>
      {person.checkins.length > 0 ? (
        <div className="mt-3 space-y-2">
          {GROUPS.map(([type, heading]) => {
            const selections = person.checkins.filter(
              (checkin) => checkin.type === type
            )
            if (selections.length === 0) return null
            return (
              <section key={type} aria-label={`${heading} đã check-in`}>
                <p className="text-xs font-semibold text-muted-foreground">
                  {heading}
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {selections.map((checkin) => (
                    <span
                      className="selection-chip"
                      key={`${checkin.type}-${checkin.code}`}
                    >
                      {labelFor(checkin)}
                    </span>
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">
          Chưa chọn địa điểm nào.
        </p>
      )}
    </li>
  )
}

function FeedMore({
  onLoadMore,
  status
}: {
  onLoadMore: () => void
  status: FeedStatus
}) {
  if (status === 'LoadingFirstPage' || status === 'LoadingMore') {
    return (
      <p className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
        <LoaderCircle className="size-4 animate-spin" /> Đang tải thêm…
      </p>
    )
  }
  if (status === 'CanLoadMore') {
    return (
      <Button className="mt-3 w-full" variant="outline" onClick={onLoadMore}>
        Tải thêm SC-ers
      </Button>
    )
  }
  return (
    <p className="py-4 text-center text-sm text-muted-foreground">
      Bạn đã xem hết danh sách rồi.
    </p>
  )
}

function FeedSkeleton() {
  return (
    <div className="space-y-2" aria-label="Đang tải danh sách SC-ers">
      {[0, 1, 2].map((item) => (
        <div
          className="animate-pulse rounded-lg border border-divider p-3"
          key={item}
        >
          <div className="h-4 w-2/5 rounded bg-secondary-soft" />
          <div className="mt-3 h-5 w-4/5 rounded bg-secondary-soft" />
        </div>
      ))}
    </div>
  )
}

function FeedEmpty() {
  return (
    <div className="px-3 py-8 text-center">
      <UsersRound
        aria-hidden="true"
        className="mx-auto size-6 text-secondary-strong"
      />
      <p className="mt-3 font-semibold">Chưa có SC-er nào trong danh sách.</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Hãy chọn địa điểm đầu tiên của bạn để mở đầu hành trình nhé.
      </p>
    </div>
  )
}

export { CommunityCheckinFeed }

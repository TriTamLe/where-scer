import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery } from 'convex/react'
import {
  Copy,
  Download,
  Globe2,
  LogOut,
  Map,
  MapPinned,
  Save
} from 'lucide-react'
import { numericToAlpha2 } from 'i18n-iso-countries'
import { useEffect, useMemo, useState } from 'react'

import { CommunityCheckinFeed } from '#/components/community-checkin-feed.tsx'
import { DanangMap } from '#/components/danang-map.tsx'
import { WishlistSignup } from '#/components/wishlist-signup.tsx'
import { Button } from '#/components/ui/button.tsx'
import { Input } from '#/components/ui/input.tsx'
import { VietnamMap } from '#/components/vietnam-map.tsx'
import { WorldMap } from '#/components/world-map.tsx'
import { clearSession, getSessionCode } from '#/lib/session.ts'
import {
  isNicknameWithinWordLimit,
  MAX_NICKNAME_WORDS
} from '#/lib/nickname.ts'
import { api } from '../../convex/_generated/api'

export const Route = createFileRoute('/where-scer')({
  component: WhereScerPage
})

type Tab = 'country' | 'province' | 'ward'
type ExportData = Record<Tab, Array<{ code: string; count: number }>>

const DENSITY_FILLS = [
  'var(--map-density-1)',
  'var(--map-density-2)',
  'var(--map-density-3)',
  'var(--map-density-4)'
] as const

function WhereScerPage() {
  const navigate = useNavigate()
  const [code, setCode] = useState(() => getSessionCode())
  const mine = useQuery(api.checkins.mine, code ? { code } : 'skip')
  const toggle = useMutation(api.checkins.toggle)
  const updateNickname = useMutation(api.accounts.updateNickname)
  const [tab, setTab] = useState<Tab>('country')
  const mapStats = useQuery(api.checkins.mapStats, {
    type: tab
  })
  const summary = useQuery(api.checkins.summary)
  const exportCounts = useQuery(
    api.checkins.exportCounts,
    mine?.canExport && code ? { code } : 'skip'
  )
  const [nickname, setNickname] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    if (!code) navigate({ to: '/', replace: true })
  }, [code, navigate])
  useEffect(() => {
    if (mine?.account.nickname) setNickname(mine.account.nickname)
  }, [mine?.account.nickname])
  useEffect(() => {
    if (mine === null) {
      clearSession()
      setCode(null)
    }
  }, [mine])

  const selected = useMemo(
    () => ({
      country:
        mine?.selected
          .filter((item) => item.type === 'country')
          .map((item) => item.code) ?? [],
      province:
        mine?.selected
          .filter((item) => item.type === 'province')
          .map((item) => item.code) ?? [],
      ward:
        mine?.selected
          .filter((item) => item.type === 'ward')
          .map((item) => item.code) ?? []
    }),
    [mine?.selected]
  )

  async function changeSelection(
    type: Tab,
    locationCode: string,
    isSelected: boolean
  ) {
    if (!code) return
    try {
      await toggle({ code, locationCode, selected: isSelected, type })
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : 'Không thể lưu check-in.'
      )
    }
  }

  function changeMapSelection(next: string[]) {
    const current = selected[tab]
    const changed = [...new Set([...current, ...next])].filter(
      (value) => current.includes(value) !== next.includes(value)
    )
    for (const locationCode of changed) {
      void changeSelection(tab, locationCode, next.includes(locationCode))
    }
  }

  async function saveNickname() {
    if (!code) return
    if (!isNicknameWithinWordLimit(nickname)) {
      setNotice(`Nickname chỉ được tối đa ${MAX_NICKNAME_WORDS} từ.`)
      return
    }
    try {
      const account = await updateNickname({ code, nickname })
      setNickname(account.nickname)
      setNotice('Đã lưu nickname.')
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : 'Không thể lưu nickname.'
      )
    }
  }

  if (!code || mine === undefined) {
    return (
      <main className="grid min-h-dvh place-items-center p-4 text-muted-foreground">
        Đang mở bản đồ của bạn…
      </main>
    )
  }
  if (mine === null) return null

  const mapProps = {
    accountCode: code,
    activeStroke: 'var(--map-active-stroke)',
    activeStrokeWidth: 2,
    defaultFill: 'var(--map-default-fill)',
    defaultStroke: 'var(--map-border-muted)',
    defaultStrokeWidth: 1,
    densityFills: DENSITY_FILLS,
    hoverFill: 'var(--map-hover-fill)',
    selectionCounts: Object.fromEntries(
      (mapStats ?? []).map((stat) => [stat.code, stat.count])
    )
  }

  return (
    <main className="app-shell space-y-7 sm:space-y-9">
      <header className="soft-panel overflow-hidden p-4 sm:p-6">
        <div className="dashboard-top-grid">
          <section className="min-w-0 bg-secondary-soft px-4 py-5 sm:px-6 sm:py-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                <div
                  aria-hidden="true"
                  className="grid size-12 shrink-0 place-items-center rounded-[45%_55%_48%_52%] border border-primary-strong bg-primary text-primary-foreground shadow-[0_5px_0_var(--primary-strong)]"
                >
                  <MapPinned className="size-5" />
                </div>
                <div className="min-w-0">
                  <p className="eyebrow">Where SC-er?</p>
                  <h1 className="mt-1 overflow-wrap-anywhere text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
                    Chào, {mine.account.nickname}!
                  </h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Bản đồ nhỏ ghi lại hành trình của cả nhà mình.
                  </p>
                </div>
              </div>
              <Button
                className="self-start"
                variant="ghost"
                onClick={() => {
                  clearSession()
                  setCode(null)
                }}
              >
                <LogOut /> Đổi account
              </Button>
            </div>
            <dl className="mt-6 grid grid-cols-2 gap-3 sm:max-w-lg">
              <Metric
                label="SC-ers đã check-in"
                value={summary?.checkedInMemberCount ?? '—'}
              />
              <Metric
                label="Quốc gia đã check-in"
                value={summary?.checkedInCountryCount ?? '—'}
              />
            </dl>
          </section>
          <WishlistSignup variant="aside" />
        </div>
        <div className="mt-4 grid gap-4 border-t border-dashed border-divider pt-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-end">
          <label className="block text-sm font-semibold">
            Nickname
            <div className="mt-2 flex gap-2">
              <Input
                maxLength={48}
                value={nickname}
                onChange={(event) => {
                  if (isNicknameWithinWordLimit(event.target.value)) {
                    setNickname(event.target.value)
                  }
                }}
              />
              <Button
                aria-label="Lưu nickname"
                variant="outline"
                onClick={saveNickname}
              >
                <Save /> <span className="hidden sm:inline">Lưu</span>
              </Button>
            </div>
          </label>
          <label className="block text-sm font-semibold">
            Mã account
            <div className="mt-2 flex gap-2">
              <Input className="font-mono" readOnly value={mine.account.code} />
              <Button
                aria-label="Sao chép mã account"
                size="icon"
                variant="outline"
                onClick={() => {
                  void navigator.clipboard.writeText(mine.account.code)
                  setNotice('Đã sao chép mã.')
                }}
              >
                <Copy />
              </Button>
            </div>
          </label>
          {mine.canExport ? <ExportButton data={exportCounts} /> : null}
        </div>
      </header>

      <section
        className="map-workspace"
        aria-label="Bản đồ và cộng đồng check-in"
      >
        <div className="hum-map-stage soft-panel min-w-0 p-3 pt-8 sm:p-5 sm:pt-10">
          <div
            className="grid grid-cols-3 gap-2"
            role="tablist"
            aria-label="Cấp bản đồ"
          >
            {(
              [
                ['country', 'Thế giới', Globe2],
                ['province', 'Việt Nam', Map],
                ['ward', 'Đà Nẵng', MapPinned]
              ] as const
            ).map(([value, label, Icon]) => (
              <Button
                aria-selected={tab === value}
                className="min-w-0 w-full px-2 sm:px-4"
                key={value}
                role="tab"
                variant={tab === value ? 'default' : 'outline'}
                onClick={() => setTab(value)}
              >
                <Icon /> <span className="hidden sm:inline">{label}</span>
              </Button>
            ))}
          </div>
          <MapActivityLegend />
          <div className="mt-5">
            {tab === 'country' ? (
              <WorldMap
                {...mapProps}
                activeValues={selected.country}
                onChange={changeMapSelection}
              />
            ) : null}
            {tab === 'province' ? (
              <VietnamMap
                {...mapProps}
                activeValues={selected.province}
                onChange={changeMapSelection}
              />
            ) : null}
            {tab === 'ward' ? (
              <DanangMap
                {...mapProps}
                activeValues={selected.ward}
                onChange={changeMapSelection}
              />
            ) : null}
          </div>
        </div>
        <CommunityCheckinFeed code={code} />
      </section>

      {notice ? (
        <p
          aria-live="polite"
          className="rounded-lg border border-info bg-info-background px-4 py-3 text-sm text-info"
        >
          {notice}
        </p>
      ) : null}
    </main>
  )
}

function MapActivityLegend() {
  return (
    <div
      aria-label="Chú giải mức hoạt động trên bản đồ"
      className="map-activity-legend mt-4"
    >
      <span className="text-xs font-semibold text-muted-foreground">
        Mức hoạt động
      </span>
      <div aria-hidden="true" className="flex items-center gap-1.5">
        {[1, 2, 3, 4].map((level) => (
          <span
            className={`map-level-dot map-level-dot--${level}`}
            key={level}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">Thấp → cao</span>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="hum-stat-node px-3 py-3 sm:px-4">
      <dt className="text-xs font-semibold tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-3xl font-semibold tracking-[-0.04em] tabular-nums">
        {value}
      </dd>
    </div>
  )
}

function ExportButton({ data }: { data: ExportData | undefined }) {
  function download(
    name: string,
    header: string,
    rows: Array<{ code: string; count: number }>
  ) {
    const content = [
      header,
      ...rows
        .sort((left, right) => left.code.localeCompare(right.code))
        .map((row) => `${row.code},${row.count}`)
    ].join('\n')
    const url = URL.createObjectURL(
      new Blob([`\ufeff${content}`], { type: 'text/csv;charset=utf-8' })
    )
    const link = document.createElement('a')
    link.href = url
    link.download = name
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Button
      disabled={!data}
      variant="secondary"
      onClick={() => {
        if (!data) return
        download(
          'country-checkins.csv',
          'country_code,checkin_count',
          data.country.map((row) => ({
            ...row,
            code: numericToAlpha2(row.code.padStart(3, '0')) ?? row.code
          }))
        )
        download(
          'vietnam-province-checkins.csv',
          'province_code,checkin_count',
          data.province
        )
        download(
          'danang-ward-checkins.csv',
          'ward_code,checkin_count',
          data.ward
        )
      }}
    >
      <Download /> Xuất dữ liệu
    </Button>
  )
}

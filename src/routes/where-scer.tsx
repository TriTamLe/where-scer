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
import { DanangMap } from '#/components/danang-map.tsx'
import { LocationList } from '#/components/location-list.tsx'
import { Button } from '#/components/ui/button.tsx'
import { Input } from '#/components/ui/input.tsx'
import { VietnamMap } from '#/components/vietnam-map.tsx'
import { WorldMap } from '#/components/world-map.tsx'
import { api } from '../../convex/_generated/api'
import { clearSession, getSessionCode } from '#/lib/session.ts'

export const Route = createFileRoute('/where-scer')({
  component: WhereScerPage
})
type Tab = 'country' | 'province' | 'ward'
type ExportData = {
  country: Array<{ code: string; count: number }>
  province: Array<{ code: string; count: number }>
  ward: Array<{ code: string; count: number }>
}
const DENSITY_FILLS = [
  'var(--primary-soft)',
  'var(--primary-muted)',
  'var(--primary)',
  'var(--primary-strong)'
] as const

function WhereScerPage() {
  const navigate = useNavigate()
  const [code, setCode] = useState(() => getSessionCode())
  const dashboard = useQuery(api.checkins.dashboard, code ? { code } : 'skip')
  const toggle = useMutation(api.checkins.toggle)
  const updateNickname = useMutation(api.accounts.updateNickname)
  const subscribe = useMutation(api.wishlist.subscribe)
  const exportCounts = useQuery(
    api.checkins.exportCounts,
    dashboard?.canExport && code ? { code } : 'skip'
  )
  const [tab, setTab] = useState<Tab>('country')
  const [nickname, setNickname] = useState('')
  const [email, setEmail] = useState('')
  const [notice, setNotice] = useState('')
  useEffect(() => {
    if (!code) navigate({ to: '/', replace: true })
  }, [code, navigate])
  useEffect(() => {
    if (dashboard?.account.nickname) setNickname(dashboard.account.nickname)
  }, [dashboard?.account.nickname])
  useEffect(() => {
    if (dashboard === null) {
      clearSession()
      setCode(null)
    }
  }, [dashboard])
  const selected = useMemo(
    () => ({
      country:
        dashboard?.selected
          .filter((item: { type: Tab }) => item.type === 'country')
          .map((item: { code: string }) => item.code) ?? [],
      province:
        dashboard?.selected
          .filter((item: { type: Tab }) => item.type === 'province')
          .map((item: { code: string }) => item.code) ?? [],
      ward:
        dashboard?.selected
          .filter((item: { type: Tab }) => item.type === 'ward')
          .map((item: { code: string }) => item.code) ?? []
    }),
    [dashboard?.selected]
  )
  const counts = useMemo(
    () =>
      Object.fromEntries(
        (dashboard?.groups[tab] ?? []).map(
          (group: { code: string; count: number }) => [group.code, group.count]
        )
      ),
    [dashboard?.groups, tab]
  )
  async function changeSelection(type: Tab, next: string[]) {
    if (!code) return
    const current = selected[type]
    const changed = [...new Set([...current, ...next])].filter(
      (value) => current.includes(value) !== next.includes(value)
    )
    await Promise.all(
      changed.map((locationCode) =>
        toggle({
          code,
          locationCode,
          selected: next.includes(locationCode),
          type
        })
      )
    )
  }
  async function saveNickname() {
    if (!code) return
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
  async function saveWishlist(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      const result = await subscribe({ email })
      setNotice(
        result.created
          ? 'Bạn đã vào wishlist rồi nhé!'
          : 'Email này đã có trong wishlist rồi nhé.'
      )
      if (result.created) setEmail('')
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Không thể lưu email.')
    }
  }
  if (!code || dashboard === undefined)
    return (
      <main className="grid min-h-screen place-items-center text-muted-foreground">
        Đang tải bản đồ…
      </main>
    )
  if (dashboard === null) return null
  const mapProps = {
    activeStroke: 'var(--map-border)',
    densityFills: DENSITY_FILLS,
    defaultFill: 'var(--background)',
    defaultStroke: 'var(--map-border-muted)',
    hoverFill: 'var(--primary-soft)',
    selectionCounts: counts
  }
  return (
    <main className="mx-auto w-full max-w-[1800px] space-y-8 p-4 sm:p-6 lg:p-8">
      <header className="border-b border-divider pb-8">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-semibold text-secondary-strong">
              WHERE SC-ER
            </p>
            <h1 className="mt-1 text-3xl font-bold">
              Chào, {dashboard.account.nickname}!
            </h1>
          </div>
          <Button
            variant="ghost"
            onClick={() => {
              clearSession()
              setCode(null)
            }}
          >
            <LogOut /> Đổi account
          </Button>
        </div>
        <div className="mt-6 grid gap-x-5 gap-y-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_auto]">
          <label className="text-sm font-semibold">
            Nickname
            <Input
              className="mt-2"
              maxLength={48}
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
            />
          </label>
          <label className="text-sm font-semibold">
            Mã của bạn
            <div className="mt-2 flex gap-2">
              <Input readOnly value={dashboard.account.code} />
              <Button
                aria-label="Sao chép mã"
                size="icon"
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(dashboard.account.code)
                  setNotice('Đã sao chép mã.')
                }}
              >
                <Copy />
              </Button>
            </div>
          </label>
          <div className="border-l-2 border-secondary px-3 py-1 text-sm">
            <strong className="block text-2xl">{dashboard.memberCount}</strong>
            SC-ers đã check-in
          </div>
          <div className="border-l-2 border-primary px-3 py-1 text-sm">
            <strong className="block text-2xl">
              {dashboard.checkedInCountryCount}
            </strong>
            quốc gia đã check-in
          </div>
        </div>
        <Button className="mt-4" onClick={saveNickname} variant="outline">
          <Save /> Lưu nickname
        </Button>
        {dashboard.canExport ? <ExportButton data={exportCounts} /> : null}
      </header>
      <section
        aria-label="map-container"
        className="w-full flex flex-col gap-6 xl:flex-row xl:items-start xl:gap-8"
      >
        <div className="min-w-0 xl:flex-1">
          <div
            className="grid grid-cols-3 gap-2"
            role="tablist"
            aria-label="Cấp bản đồ"
          >
            {(
              [
                [
                  'country',
                  'Thế giới',
                  Globe2,
                  'border-secondary-muted bg-secondary-soft text-secondary-strong hover:bg-secondary-muted',
                  'border-secondary bg-secondary text-white hover:border-secondary-strong hover:bg-secondary-strong'
                ],
                [
                  'province',
                  'Việt Nam',
                  Map,
                  'border-secondary-muted bg-secondary-soft text-secondary-strong hover:bg-secondary-muted',
                  'border-secondary bg-secondary text-white hover:border-secondary-strong hover:bg-secondary-strong'
                ],
                [
                  'ward',
                  'Đà Nẵng',
                  MapPinned,
                  'border-secondary-muted bg-secondary-soft text-secondary-strong hover:bg-secondary-muted',
                  'border-secondary bg-secondary text-white hover:border-secondary-strong hover:bg-secondary-strong'
                ]
              ] as const
            ).map(([value, label, Icon, inactiveClass, activeClass]) => (
              <Button
                aria-label={label}
                aria-selected={tab === value}
                className={`w-full px-2 sm:px-6 ${
                  tab === value ? activeClass : inactiveClass
                }`}
                key={value}
                role="tab"
                size="lg"
                title={label}
                variant="outline"
                onClick={() => setTab(value)}
              >
                <Icon />{' '}
                <span className="hidden truncate sm:inline">{label}</span>
              </Button>
            ))}
          </div>
          <div className="mt-6">
            {tab === 'country' ? (
              <WorldMap
                {...mapProps}
                activeStrokeWidth={2}
                defaultStrokeWidth={1}
                activeValues={selected.country}
                onChange={(next) => changeSelection('country', next)}
              />
            ) : null}
            {tab === 'province' ? (
              <VietnamMap
                {...mapProps}
                activeStrokeWidth={2}
                defaultStrokeWidth={1}
                activeValues={selected.province}
                onChange={(next) => changeSelection('province', next)}
              />
            ) : null}
            {tab === 'ward' ? (
              <DanangMap
                {...mapProps}
                activeStrokeWidth={2}
                defaultStrokeWidth={1}
                activeValues={selected.ward}
                onChange={(next) => changeSelection('ward', next)}
              />
            ) : null}
          </div>
        </div>

        <div className="relative">
          <LocationList
            groups={dashboard.groups[tab]}
            selected={selected[tab]}
            type={tab}
          />
        </div>
      </section>
      <section className="border-t border-divider pt-8">
        <h2 className="text-xl font-semibold">
          Chúng mình có một số điều thú vị sắp đến, bạn có muốn vào trong
          wishlist không?
        </h2>
        <form
          className="mt-4 flex flex-col gap-3 sm:flex-row"
          onSubmit={saveWishlist}
        >
          <label className="grow">
            <span className="sr-only">Email</span>
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="email@example.com"
              required
            />
          </label>
          <Button type="submit">Vào wishlist</Button>
        </form>
      </section>
      {notice ? (
        <p
          aria-live="polite"
          className="border-l-2 border-info bg-info-background px-3 py-2 text-sm text-info"
        >
          {notice}
        </p>
      ) : null}
    </main>
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
      className="mt-4 ml-0 sm:ml-3"
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

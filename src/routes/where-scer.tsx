import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useConvex, useMutation, useQuery } from 'convex/react'
import {
  Copy,
  Download,
  Globe2,
  LogOut,
  Map,
  MapPinned,
  Save,
  Search
} from 'lucide-react'
import { numericToAlpha2 } from 'i18n-iso-countries'
import { useEffect, useMemo, useState } from 'react'

import { DanangMap } from '#/components/danang-map.tsx'
import { LocationList } from '#/components/location-list.tsx'
import { Button } from '#/components/ui/button.tsx'
import { Input } from '#/components/ui/input.tsx'
import { VietnamMap } from '#/components/vietnam-map.tsx'
import { WORLD_LOCATIONS, WorldMap } from '#/components/world-map.tsx'
import { clearSession, getSessionCode } from '#/lib/session.ts'
import { api } from '../../convex/_generated/api'

export const Route = createFileRoute('/where-scer')({
  component: WhereScerPage
})

type Tab = 'country' | 'province' | 'ward'
type Person = { nickname: string; publicId: string }
type CountryPage = { continueCursor: string; isDone: boolean; page: Person[] }
type PublicProfile = {
  checkins: Array<{ code: string; type: Tab }>
  nickname: string
  publicId: string
} | null
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
  const convex = useConvex()
  const [code, setCode] = useState(() => getSessionCode())
  const mine = useQuery(api.checkins.mine, code ? { code } : 'skip')
  const toggle = useMutation(api.checkins.toggle)
  const updateNickname = useMutation(api.accounts.updateNickname)
  const [tab, setTab] = useState<Tab>('country')
  const mapStats = useQuery(api.checkins.mapStats, { type: tab })
  const summary = useQuery(api.checkins.summary)
  const exportCounts = useQuery(
    api.checkins.exportCounts,
    mine?.canExport && code ? { code } : 'skip'
  )
  const subscribe = useMutation(api.wishlist.subscribe)
  const [nickname, setNickname] = useState('')
  const [email, setEmail] = useState('')
  const [notice, setNotice] = useState('')
  const [countrySearch, setCountrySearch] = useState('')
  const [selectedCountry, setSelectedCountry] = useState<
    (typeof WORLD_LOCATIONS)[number] | null
  >(null)
  const [countryPage, setCountryPage] = useState<CountryPage | null>(null)
  const [countryPeople, setCountryPeople] = useState<Person[]>([])
  const [countryStatus, setCountryStatus] = useState<
    'idle' | 'loading' | 'error'
  >('idle')
  const [personSearch, setPersonSearch] = useState('')
  const [personResults, setPersonResults] = useState<Person[]>([])
  const [personStatus, setPersonStatus] = useState<
    'idle' | 'loading' | 'error'
  >('idle')
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)
  const [publicProfile, setPublicProfile] = useState<PublicProfile>(null)
  const [profileStatus, setProfileStatus] = useState<
    'idle' | 'loading' | 'error'
  >('idle')

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
  useEffect(() => {
    const query = personSearch.trim()
    if (query.length < 2) {
      setPersonResults([])
      setPersonStatus('idle')
      return
    }
    const timeout = window.setTimeout(() => {
      setPersonStatus('loading')
      convex
        .query(api.accounts.searchPeople, { query })
        .then((results) => {
          setPersonResults(results)
          setPersonStatus('idle')
        })
        .catch(() => setPersonStatus('error'))
    }, 300)
    return () => window.clearTimeout(timeout)
  }, [convex, personSearch])

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
  const countryOptions = useMemo(() => {
    const query = countrySearch.trim().toLocaleLowerCase('vi')
    if (!query) return []
    return WORLD_LOCATIONS.filter(
      (country) =>
        country.name.toLocaleLowerCase('vi').includes(query) ||
        country.code.includes(query)
    ).slice(0, 8)
  }, [countrySearch])

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

  async function loadCountryPeople(countryCode: string, cursor: string | null) {
    setCountryStatus('loading')
    try {
      const result = await convex.query(api.checkins.peopleByCountry, {
        countryCode,
        paginationOpts: { cursor, numItems: 50 }
      })
      const page = result
      setCountryPage(page)
      setCountryPeople((current) =>
        cursor ? [...current, ...page.page] : page.page
      )
      setCountryStatus('idle')
    } catch {
      setCountryStatus('error')
    }
  }

  function chooseCountry(country: (typeof WORLD_LOCATIONS)[number]) {
    setSelectedCountry(country)
    setCountrySearch(country.name)
    setCountryPeople([])
    void loadCountryPeople(country.code, null)
  }

  async function choosePerson(person: Person) {
    setSelectedPerson(person)
    setPersonSearch(person.nickname)
    setPersonResults([])
    setProfileStatus('loading')
    try {
      const profile = await convex.query(api.checkins.profileCheckins, {
        publicId: person.publicId
      })
      setPublicProfile(profile)
      setProfileStatus('idle')
    } catch {
      setProfileStatus('error')
    }
  }

  if (!code || mine === undefined) {
    return (
      <main className="grid min-h-screen place-items-center text-muted-foreground">
        Đang tải bản đồ…
      </main>
    )
  }
  if (mine === null) return null

  const mapProps = {
    activeStroke: 'var(--map-border)',
    activeStrokeWidth: 2,
    defaultFill: 'var(--background)',
    defaultStroke: 'var(--map-border-muted)',
    defaultStrokeWidth: 1,
    densityFills: DENSITY_FILLS,
    hoverFill: 'var(--primary-muted)',
    selectionCounts: Object.fromEntries(
      (mapStats ?? []).map((stat) => [stat.code, stat.count])
    )
  }

  return (
    <main className="mx-auto w-full max-w-[1800px] space-y-8 p-4 sm:p-6 lg:p-8">
      <header className="border-b border-divider pb-8">
        <div>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <div
                aria-hidden="true"
                className="grid size-12 shrink-0 place-items-center text-secondary-strong"
              >
                <MapPinned className="size-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold tracking-[0.12em] text-secondary-strong">
                  WHERE SC-ER
                </p>
                <h1 className="mt-1 truncate text-2xl font-bold tracking-tight sm:text-3xl">
                  Chào, {mine.account.nickname}!
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Hồ sơ công khai{' '}
                  <span className="font-mono text-xs font-medium text-foreground">
                    {mine.account.publicId}
                  </span>
                </p>
                <dl className="mt-4 flex flex-wrap divide-x divide-divider text-sm">
                  <div className="pr-4">
                    <dt className="text-muted-foreground">SC-ers đã check-in</dt>
                    <dd className="mt-1 text-xl font-semibold tabular-nums">
                      {summary?.checkedInMemberCount ?? '—'}
                    </dd>
                  </div>
                  <div className="pl-4">
                    <dt className="text-muted-foreground">Quốc gia đã check-in</dt>
                    <dd className="mt-1 text-xl font-semibold tabular-nums">
                      {summary?.checkedInCountryCount ?? '—'}
                    </dd>
                  </div>
                </dl>
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

          <div className="mt-6 grid gap-4 border-t border-divider pt-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-end">
            <label className="block text-sm font-semibold">
              Nickname
              <div className="mt-2 flex gap-2">
                <Input
                  maxLength={48}
                  value={nickname}
                  onChange={(event) => setNickname(event.target.value)}
                />
                <Button
                  aria-label="Lưu nickname"
                  onClick={saveNickname}
                  variant="outline"
                >
                  <Save /> <span className="hidden sm:inline">Lưu</span>
                </Button>
              </div>
            </label>
            <label className="block text-sm font-semibold">
              Mã account
              <div className="mt-2 flex gap-2">
                <Input
                  className="font-mono"
                  readOnly
                  value={mine.account.code}
                />
                <Button
                  aria-label="Sao chép mã account"
                  size="icon"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(mine.account.code)
                    setNotice('Đã sao chép mã.')
                  }}
                >
                  <Copy />
                </Button>
              </div>
            </label>
            {mine.canExport ? <ExportButton data={exportCounts} /> : null}
          </div>
        </div>
      </header>

      <section
        aria-label="Bản đồ cá nhân"
        className="flex flex-col gap-6 xl:flex-row xl:items-start xl:gap-8"
      >
        <div className="min-w-0 xl:flex-1">
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
                className="w-full"
                key={value}
                role="tab"
                variant={tab === value ? 'default' : 'outline'}
                onClick={() => setTab(value)}
              >
                <Icon /> <span className="hidden sm:inline">{label}</span>
              </Button>
            ))}
          </div>
          <div className="mt-6">
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
        <LocationList
          selected={selected[tab]}
          type={tab}
          onToggle={(locationCode, isSelected) =>
            void changeSelection(tab, locationCode, isSelected)
          }
        />
      </section>

      <section className="grid gap-6 border-t border-divider pt-8 lg:grid-cols-2">
        <SearchPanel
          title="Tìm người đã check-in một quốc gia"
          description="Chọn một quốc gia để xem danh sách người đã check-in."
        >
          <label className="relative block">
            <span className="sr-only">Tìm quốc gia</span>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-3 size-4 text-muted-foreground"
            />
            <Input
              className="pl-10"
              value={countrySearch}
              onChange={(event) => setCountrySearch(event.target.value)}
              placeholder="Nhập tên quốc gia…"
            />
          </label>
          {countryOptions.length > 0 ? (
            <ul
              className="mt-3 border-y border-divider"
              role="listbox"
              aria-label="Gợi ý quốc gia"
            >
              {countryOptions.map((country) => (
                <li key={country.code}>
                  <button
                    className="w-full border-b border-divider px-3 py-2 text-left text-sm last:border-b-0 hover:bg-secondary-soft focus-visible:outline-2 focus-visible:outline-primary"
                    type="button"
                    onClick={() => chooseCountry(country)}
                  >
                    {country.name}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          {selectedCountry ? (
            <PeopleList
              country={selectedCountry.name}
              people={countryPeople}
              status={countryStatus}
            />
          ) : null}
          {countryPage && !countryPage.isDone ? (
            <Button
              className="mt-3"
              disabled={countryStatus === 'loading'}
              variant="outline"
              onClick={() =>
                selectedCountry &&
                void loadCountryPeople(
                  selectedCountry.code,
                  countryPage.continueCursor
                )
              }
            >
              Tải thêm
            </Button>
          ) : null}
        </SearchPanel>

        <SearchPanel
          title="Tìm nơi một người đã check-in"
          description="Tìm theo nickname, rồi chọn đúng hồ sơ qua mã công khai."
        >
          <label className="relative block">
            <span className="sr-only">Tìm người dùng</span>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-3 size-4 text-muted-foreground"
            />
            <Input
              className="pl-10"
              value={personSearch}
              onChange={(event) => setPersonSearch(event.target.value)}
              placeholder="Nhập ít nhất 2 ký tự…"
            />
          </label>
          {personStatus === 'loading' ? (
            <p className="mt-3 text-sm text-muted-foreground">Đang tìm…</p>
          ) : null}
          {personStatus === 'error' ? (
            <p className="mt-3 text-sm text-destructive">
              Không thể tìm người dùng lúc này.
            </p>
          ) : null}
          {personResults.length > 0 ? (
            <ul
              className="mt-3 border-y border-divider"
              role="listbox"
              aria-label="Kết quả tìm người"
            >
              {personResults.map((person) => (
                <li key={person.publicId}>
                  <button
                    className="w-full border-b border-divider px-3 py-2 text-left text-sm last:border-b-0 hover:bg-secondary-soft focus-visible:outline-2 focus-visible:outline-primary"
                    type="button"
                    onClick={() => void choosePerson(person)}
                  >
                    {person.nickname}{' '}
                    <span className="text-muted-foreground">
                      {person.publicId}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          {selectedPerson ? (
            <ProfileCheckins profile={publicProfile} status={profileStatus} />
          ) : null}
        </SearchPanel>
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

function SearchPanel({
  children,
  description,
  title
}: {
  children: React.ReactNode
  description: string
  title: string
}) {
  return (
    <section className="border-t border-divider pt-5">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <div className="mt-4">{children}</div>
    </section>
  )
}

function PeopleList({
  country,
  people,
  status
}: {
  country: string
  people: Person[]
  status: 'idle' | 'loading' | 'error'
}) {
  if (status === 'loading')
    return (
      <p className="mt-3 text-sm text-muted-foreground">
        Đang tải người đã check-in {country}…
      </p>
    )
  if (status === 'error')
    return (
      <p className="mt-3 text-sm text-destructive">
        Không thể tải danh sách lúc này.
      </p>
    )
  if (people.length === 0)
    return (
      <p className="mt-3 text-sm text-muted-foreground">
        Chưa có ai check-in {country}.
      </p>
    )
  return (
    <ul
      className="mt-3 divide-y border-y border-divider"
      aria-label={`Người đã check-in ${country}`}
    >
      {people.map((person) => (
        <li className="px-3 py-2 text-sm" key={person.publicId}>
          {person.nickname}{' '}
          <span className="text-muted-foreground">{person.publicId}</span>
        </li>
      ))}
    </ul>
  )
}

function ProfileCheckins({
  profile,
  status
}: {
  profile: PublicProfile
  status: 'idle' | 'loading' | 'error'
}) {
  if (status === 'loading')
    return (
      <p className="mt-3 text-sm text-muted-foreground">Đang tải địa điểm…</p>
    )
  if (status === 'error')
    return (
      <p className="mt-3 text-sm text-destructive">
        Không thể tải địa điểm lúc này.
      </p>
    )
  if (!profile)
    return (
      <p className="mt-3 text-sm text-muted-foreground">
        Không tìm thấy hồ sơ này.
      </p>
    )
  if (profile.checkins.length === 0)
    return (
      <p className="mt-3 text-sm text-muted-foreground">
        {profile.nickname} chưa check-in địa điểm nào.
      </p>
    )
  return (
    <div className="mt-3">
      <p className="text-sm font-medium">{profile.nickname} đã check-in:</p>
      <ul className="mt-2 divide-y border-y border-divider">
        {profile.checkins.map((checkin) => (
          <li
            className="px-3 py-2 text-sm"
            key={`${checkin.type}-${checkin.code}`}
          >
            <span className="font-medium">{labelForType(checkin.type)}</span> ·{' '}
            {checkin.code}
          </li>
        ))}
      </ul>
    </div>
  )
}

function labelForType(type: Tab) {
  return type === 'country'
    ? 'Quốc gia'
    : type === 'province'
      ? 'Tỉnh/thành'
      : 'Phường/xã'
}

import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useConvex, useMutation } from 'convex/react'
import { ArrowRight, Dices, LogIn } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '#/components/ui/button.tsx'
import { Input } from '#/components/ui/input.tsx'
import { randomNickname } from '#/data/nicknames.ts'
import { api } from '../../convex/_generated/api'
import { getSessionCode, setSessionCode } from '#/lib/session.ts'

export const Route = createFileRoute('/')({ component: OnboardingPage })

const CLUB_PHRASE = 'taolapkynanglamnencuocsong'

function OnboardingPage() {
  const navigate = useNavigate()
  const convex = useConvex()
  const createAccount = useMutation(api.accounts.create)
  const [step, setStep] = useState<1 | 2>(1)
  const [answer, setAnswer] = useState('')
  const [nickname, setNickname] = useState('')
  const [loginCode, setLoginCode] = useState('')
  const [message, setMessage] = useState('')
  const [isBusy, setIsBusy] = useState(false)

  useEffect(() => {
    if (getSessionCode()) navigate({ to: '/where-scer', replace: true })
  }, [navigate])

  function handlePhrase(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (answer.trim().toLowerCase() !== CLUB_PHRASE) {
      setMessage('Chưa đúng rồi bạn ơi, thử lại nhé.')
      return
    }
    setMessage('Chính xác')
    window.setTimeout(() => {
      setMessage('')
      setStep(2)
    }, 650)
  }

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsBusy(true)
    setMessage('')
    try {
      const account = await createAccount({ nickname })
      setSessionCode(account.code)
      navigate({ to: '/where-scer' })
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Không thể tạo account lúc này.'
      )
    } finally {
      setIsBusy(false)
    }
  }

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!loginCode.trim()) {
      setMessage('Bạn chưa có mã thì tạo một account mới ở phía trên nhé.')
      return
    }
    setIsBusy(true)
    setMessage('')
    try {
      const account = await convex.query(api.accounts.getByCode, {
        code: loginCode
      })
      if (!account) {
        setMessage('Mình chưa tìm thấy mã này.')
        return
      }
      setSessionCode(account.code)
      navigate({ to: '/where-scer' })
    } catch {
      setMessage('Không thể kiểm tra mã lúc này.')
    } finally {
      setIsBusy(false)
    }
  }

  return (
    <main className="grid min-h-screen place-items-center p-4 sm:p-6">
      <section className="w-full max-w-xl rounded-2xl border bg-card p-6 shadow-sm sm:p-10">
        <p className="text-sm font-semibold tracking-wide text-secondary-strong">
          WHERE SC-ER
        </p>
        {step === 1 ? (
          <>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Vui lòng nhập vào 2 câu, 8 chữ mà mọi SC-er nào cũng biết
            </h1>
            <p className="mt-3 text-muted-foreground">
              Hãy viết liền, không dấu nhé.
            </p>
            <form
              className="mt-7 space-y-4 flex flex-col gap-2"
              onSubmit={handlePhrase}
            >
              <label>
                <span className="sr-only">Câu trả lời</span>
                <Input
                  autoFocus
                  value={answer}
                  onChange={(event) => setAnswer(event.target.value)}
                  placeholder="Viết câu trả lời ở đây"
                />
              </label>
              <Button className="w-full" size="lg" type="submit">
                Tiếp tục <ArrowRight />
              </Button>
            </form>
          </>
        ) : (
          <>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Cho mình xin một cái nickname nhé
            </h1>
            <p className="mt-3 text-muted-foreground">
              Tên thật của bạn hoặc bất kỳ tên nào bạn thích đều được.
            </p>
            <form className="mt-7 space-y-4" onSubmit={handleCreate}>
              <label className="block text-sm font-semibold">
                Nickname
                <Input
                  className="mt-2"
                  maxLength={48}
                  value={nickname}
                  onChange={(event) => setNickname(event.target.value)}
                  placeholder="Ví dụ: Rái cá lấp lánh"
                  required
                />
              </label>
              <Button
                className="w-full"
                disabled={isBusy}
                size="lg"
                type="submit"
              >
                Tạo account <ArrowRight />
              </Button>
            </form>
            <Button
              className="mt-3 w-full"
              disabled={isBusy}
              variant="secondary"
              onClick={() => setNickname(randomNickname())}
            >
              <Dices /> Random nickname
            </Button>
            <div className="my-8 border-t" />
            <h2 className="text-lg font-semibold">Đã có mã từ trước?</h2>
            <form
              className="mt-3 flex flex-col gap-3 sm:flex-row"
              onSubmit={handleLogin}
            >
              <label className="grow">
                <span className="sr-only">Mã account</span>
                <Input
                  value={loginCode}
                  onChange={(event) => setLoginCode(event.target.value)}
                  placeholder="SC-XXXXXX"
                />
              </label>
              <Button disabled={isBusy} type="submit" variant="outline">
                <LogIn /> Đăng nhập
              </Button>
            </form>
          </>
        )}
        {message ? (
          <p
            aria-live="polite"
            className={`mt-5 rounded-lg p-3 text-sm font-medium ${message === 'Chính xác' ? 'animate-pulse bg-success-background text-success' : 'bg-destructive-background text-destructive'}`}
          >
            {message}
          </p>
        ) : null}
      </section>
    </main>
  )
}

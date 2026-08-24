import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useConvex, useMutation } from 'convex/react'
import { ArrowRight, Dices, LogIn, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '#/components/ui/button.tsx'
import { Input } from '#/components/ui/input.tsx'
import { randomNickname } from '#/data/nicknames.ts'
import { getSessionCode, setSessionCode } from '#/lib/session.ts'
import { api } from '../../convex/_generated/api'

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
    setMessage('Chính xác rồi, mình cùng đánh dấu hành trình nhé.')
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
    <main className="grid min-h-dvh place-items-center overflow-hidden bg-background p-4 sm:p-6">
      <section className="soft-panel grid w-full max-w-5xl overflow-hidden lg:grid-cols-[minmax(0,1.05fr)_minmax(22rem,0.95fr)]">
        <div className="relative bg-secondary-soft px-6 py-8 sm:px-10 sm:py-11">
          <div
            className="hum-character"
            data-happy={message.startsWith('Chính xác')}
          >
            <span className="sr-only">Dấu mốc hành trình</span>
          </div>
          <div className="mt-10 max-w-xl">
            <p className="eyebrow">Where SC-er?</p>
            <h1 className="mt-3 text-[var(--text-display)] leading-[0.98] font-semibold tracking-[-0.035em]">
              Đánh dấu nơi hành trình của bạn đi qua.
            </h1>
            <p className="mt-5 max-w-lg leading-7 text-muted-foreground">
              Một bản đồ nhỏ để cả nhà mình nhìn thấy nhau đang ở đâu và đã đi
              những đâu.
            </p>
          </div>
          <div className="mt-10 flex items-center gap-3 text-sm font-semibold text-secondary-strong">
            <Sparkles aria-hidden="true" className="size-4" />
            <span>Chọn một điểm, để lại một dấu mốc.</span>
          </div>
        </div>
        <div className="bg-card px-6 py-8 sm:px-10 sm:py-11">
          <div className="flex items-center gap-3 text-sm font-semibold text-muted-foreground">
            <span className="grid size-8 place-items-center rounded-full bg-primary text-primary-foreground shadow-[0_3px_0_var(--primary-strong)]">
              {step}
            </span>
            <span>
              {step === 1
                ? 'Cùng nhận ra nhau trước nhé'
                : 'Chọn một nickname để bắt đầu'}
            </span>
          </div>
          {step === 1 ? (
            <>
              <h2 className="mt-6 text-2xl font-semibold tracking-[-0.025em]">
                Vui lòng nhập 2 câu, 8 chữ mà mọi SC-er đều biết.
              </h2>
              <p className="mt-2 text-muted-foreground">
                Viết liền, không dấu nhé.
              </p>
              <form
                className="mt-6 flex flex-col gap-3"
                onSubmit={handlePhrase}
              >
                <label className="text-sm font-semibold">
                  Câu trả lời
                  <Input
                    autoFocus
                    className="mt-2"
                    value={answer}
                    onChange={(event) => setAnswer(event.target.value)}
                    placeholder="Viết câu trả lời ở đây"
                  />
                </label>
                <Button className="w-full sm:w-fit" size="lg" type="submit">
                  Tiếp tục <ArrowRight />
                </Button>
              </form>
            </>
          ) : (
            <>
              <h2 className="mt-6 text-2xl font-semibold tracking-[-0.025em]">
                Cho mình xin một cái nickname nhé.
              </h2>
              <p className="mt-2 text-muted-foreground">
                Tên thật hoặc bất kỳ tên nào bạn thích đều được.
              </p>
              <form className="mt-6" onSubmit={handleCreate}>
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
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <Button disabled={isBusy} size="lg" type="submit">
                    Tạo account <ArrowRight />
                  </Button>
                  <Button
                    disabled={isBusy}
                    variant="secondary"
                    onClick={() => setNickname(randomNickname())}
                  >
                    <Dices /> Random nickname
                  </Button>
                </div>
              </form>
              <div className="my-7 border-t border-dashed border-divider" />
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
              className={`mt-5 rounded-[var(--radius-input)] border px-4 py-3 text-sm font-medium ${message.startsWith('Chính xác') ? 'border-success bg-success-background text-success' : 'border-destructive bg-destructive-background text-destructive'}`}
            >
              {message}
            </p>
          ) : null}
        </div>
      </section>
    </main>
  )
}

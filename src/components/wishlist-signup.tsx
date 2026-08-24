import { useMutation } from 'convex/react'
import { Mail, Sparkles } from 'lucide-react'
import { useState } from 'react'

import { Button } from '#/components/ui/button.tsx'
import { Input } from '#/components/ui/input.tsx'
import { api } from '../../convex/_generated/api'

type WishlistSignupProps = {
  variant?: 'aside' | 'section'
}

function WishlistSignup({ variant = 'section' }: WishlistSignupProps) {
  const subscribe = useMutation(api.wishlist.subscribe)
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showBurst, setShowBurst] = useState(false)
  const [status, setStatus] = useState<'error' | 'idle' | 'success'>('idle')

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)
    setMessage('')
    setStatus('idle')
    setShowBurst(false)
    try {
      const result = await subscribe({ email })
      if (result.created) {
        setEmail('')
        setMessage('Bạn đã vào wishlist rồi nhé!')
        setStatus('success')
        setShowBurst(true)
        window.setTimeout(() => setShowBurst(false), 500)
      } else {
        setMessage('Email này đã có trong wishlist rồi nhé.')
        setStatus('success')
      }
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : 'Không thể lưu email lúc này.'
      )
      setStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section
      aria-labelledby="wishlist-title"
      className={`hum-wishlist hum-wishlist--${variant}`}
    >
      <div
        className={`hum-band-coral px-5 py-7 ${variant === 'aside' ? 'sm:px-6 sm:py-6' : 'sm:px-8 sm:py-9'}`}
      >
        <div className={variant === 'aside' ? '' : 'max-w-2xl'}>
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="grid size-11 place-items-center rounded-full bg-accent text-[var(--accent-foreground)] shadow-[0_4px_0_var(--accent-strong)]"
            >
              <Mail className="size-5" />
            </span>
            <p className="eyebrow text-[var(--accent-strong)]">Wishlist</p>
          </div>
          <h2
            className={`mt-4 max-w-xl leading-[1.02] font-semibold tracking-[-0.025em] ${variant === 'aside' ? 'text-2xl sm:text-3xl' : 'text-[var(--text-display-s)]'}`}
            id="wishlist-title"
          >
            {variant === 'aside'
              ? 'Đừng bỏ lỡ điều sắp tới.'
              : 'Có vài điều thú vị đang đến.'}
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
            Để lại email, tụi mình sẽ báo khi có chuyện mới để cùng khám phá.
          </p>
          <form
            className={`mt-5 flex gap-3 ${variant === 'aside' ? 'flex-col' : 'flex-col sm:flex-row'}`}
            onSubmit={submit}
          >
            <label className="min-w-0 flex-1">
              <span className="sr-only">Email</span>
              <Input
                autoComplete="email"
                aria-invalid={status === 'error' || undefined}
                data-state={isSubmitting ? 'loading' : status}
                disabled={isSubmitting}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="email@example.com"
                required
                type="email"
                value={email}
              />
            </label>
            <Button
              data-state={isSubmitting ? 'loading' : status}
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? 'Đang lưu…' : 'Vào wishlist'} <Sparkles />
            </Button>
          </form>
          {message ? (
            <p
              aria-live="polite"
              className="mt-4 text-sm font-semibold text-[var(--accent-strong)]"
            >
              {message}
            </p>
          ) : null}
        </div>
      </div>
      <Sparkles
        aria-hidden="true"
        className="star-burst size-7"
        data-visible={showBurst}
      />
    </section>
  )
}

export { WishlistSignup }

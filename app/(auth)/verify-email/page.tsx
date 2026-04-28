import { AuthPageShell } from "@/components/auth/auth-page-shell"
import { VerifyEmailNotice } from "@/components/auth/verify-email-notice"

type AuthPageSearchParams = Promise<{
  [key: string]: string | string[] | undefined
}>

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: AuthPageSearchParams
}) {
  const params = await searchParams
  const status = getFirstParam(params.status)
  const providerError = getFirstParam(params.error)

  return (
    <AuthPageShell>
      <VerifyEmailNotice
        status={status}
        hasProviderError={Boolean(providerError)}
      />
    </AuthPageShell>
  )
}

function getFirstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

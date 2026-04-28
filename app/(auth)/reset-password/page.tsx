import { AuthPageShell } from "@/components/auth/auth-page-shell"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"

type AuthPageSearchParams = Promise<{
  [key: string]: string | string[] | undefined
}>

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: AuthPageSearchParams
}) {
  const params = await searchParams
  const token = getFirstParam(params.token)
  const providerError = getFirstParam(params.error)

  return (
    <AuthPageShell>
      <ResetPasswordForm
        hasToken={Boolean(token)}
        hasProviderError={Boolean(providerError)}
      />
    </AuthPageShell>
  )
}

function getFirstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

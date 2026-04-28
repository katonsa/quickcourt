import { ChangePasswordForm } from "@/components/auth/change-password-form"

export default function DashboardSettingsPage() {
  return (
    <main className="bg-background">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-12">
        <div className="max-w-2xl space-y-3">
          <h1 className="text-3xl font-semibold tracking-normal text-foreground">
            Settings
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            Manage the password for your QuickCourt account.
          </p>
        </div>
        <ChangePasswordForm />
      </section>
    </main>
  )
}

"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupTextarea } from "@/components/ui/input-group"
import { Spinner } from "@/components/ui/spinner"

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.email("Please enter a valid email address."),
  message: z.string().min(10, "Message must be at least 10 characters."),
})

export function ContactForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  })

  const isSubmitting = form.formState.isSubmitting

  async function onSubmit(data: z.infer<typeof formSchema>) {
    await new Promise((resolve) => setTimeout(resolve, 800))

    toast("Message sent successfully!", {
      description: (
        <pre className="bg-code text-code-foreground mt-2 w-[320px] overflow-x-auto rounded-md p-4">
          <code>{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
      position: "bottom-right",
      classNames: {
        content: "flex flex-col gap-2",
      },
      style: {
        "--border-radius": "calc(var(--radius) + 4px)",
      } as React.CSSProperties,
    })

    form.reset()
  }

  return (
    <Card className="w-full sm:max-w-md">
      <CardHeader>
        <CardTitle>Contact Us</CardTitle>
        <CardDescription>
          Send us a message and we will get back to you soon.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form id="contact-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="contact-name">Name</FieldLabel>
                  <Input
                    {...field}
                    id="contact-name"
                    placeholder="Your name"
                    autoComplete="name"
                    aria-invalid={fieldState.invalid}
                    disabled={isSubmitting}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="contact-email">Email</FieldLabel>
                  <Input
                    {...field}
                    id="contact-email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    aria-invalid={fieldState.invalid}
                    disabled={isSubmitting}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="message"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="contact-message">Message</FieldLabel>

                  <InputGroup>
                    <InputGroupTextarea
                      {...field}
                      id="contact-message"
                      placeholder="Write your message..."
                      rows={5}
                      className="min-h-24 resize-none"
                      aria-invalid={fieldState.invalid}
                      disabled={isSubmitting}
                    />
                  </InputGroup>

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent>

      <CardFooter>
        <Field orientation="horizontal">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            disabled={isSubmitting}
          >
            Reset
          </Button>

          <Button
            type="submit"
            form="contact-form"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting && <Spinner />}
            {isSubmitting ? "Sending..." : "Send Message"}
          </Button>
        </Field>
      </CardFooter>
    </Card>
  )
}

export default function Home() {
  return (
    <div className="flex min-h-svh items-center justify-center">
      <ContactForm />
    </div>
  )
}

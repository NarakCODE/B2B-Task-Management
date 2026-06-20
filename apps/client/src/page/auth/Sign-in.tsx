import { useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"

import { Form, FormField } from "@/components/ui/form"
import { Field, FieldContent, FieldError, FieldLabel, FieldSeparator } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import Logo from "@/components/logo"
import GoogleOauthButton from "@/components/auth/google-oauth-button"
import { useMutation } from "@tanstack/react-query"
import { loginMutationFn } from "@/lib/api"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"
import { EyeIcon, EyeOffIcon } from "lucide-react"

const SignIn = () => {
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const returnUrl = searchParams.get("returnUrl")

  const { mutate, isPending } = useMutation({
    mutationFn: loginMutationFn,
  })

  const formSchema = z.object({
    email: z.string().trim().email("Invalid email address").min(1, {
      message: "Email is required",
    }),
    password: z.string().trim().min(1, {
      message: "Password is required",
    }),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (isPending) return

    mutate(values, {
      onSuccess: (data) => {
        const user = data.user
        const decodedUrl = returnUrl ? decodeURIComponent(returnUrl) : null
        navigate(decodedUrl || `/workspace/${user.currentWorkspace}`)
      },
      onError: (error) => {
        toast.error(error.message)
      },
    })
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-6 p-6 md:p-10">
        <Link to="/" className="flex items-center gap-2 font-medium">
          <Logo />
          Team Sync.
        </Link>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-balance text-sm text-muted-foreground">
                  Login with your Email or Google account
                </p>
              </div>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <div className="flex flex-col gap-6">
                    <GoogleOauthButton label="Login" />
                    <FieldSeparator>Or continue with</FieldSeparator>
                    <div className="flex flex-col gap-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field, fieldState }) => (
                          <Field data-invalid={!!fieldState.error}>
                            <FieldLabel htmlFor="email">Email</FieldLabel>
                            <FieldContent>
                              <Input
                                id="email"
                                placeholder="m@example.com"
                                aria-invalid={!!fieldState.error}
                                {...field}
                              />
                              <FieldError errors={fieldState.error ? [fieldState.error] : []} />
                            </FieldContent>
                          </Field>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field, fieldState }) => (
                          <Field data-invalid={!!fieldState.error}>
                            <div className="flex w-full items-center">
                              <FieldLabel htmlFor="password">Password</FieldLabel>
                              <a
                                href="#"
                                className="ml-auto text-sm underline-offset-4 hover:underline"
                              >
                                Forgot your password?
                              </a>
                            </div>
                            <FieldContent>
                              <InputGroup>
                                <InputGroupInput
                                  id="password"
                                  type={showPassword ? "text" : "password"}
                                  aria-invalid={!!fieldState.error}
                                  {...field}
                                />
                                <InputGroupAddon align="inline-end">
                                  <InputGroupButton
                                    size="icon-xs"
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex={-1}
                                  >
                                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                                  </InputGroupButton>
                                </InputGroupAddon>
                              </InputGroup>
                              <FieldError errors={fieldState.error ? [fieldState.error] : []} />
                            </FieldContent>
                          </Field>
                        )}
                      />
                    </div>
                    <Button disabled={isPending} type="submit" className="w-full">
                      {isPending && <Spinner data-icon="inline-start" />}
                      Login
                    </Button>
                    <div className="text-center text-sm">
                      Don&apos;t have an account?{" "}
                      <Link to="/sign-up" className="underline underline-offset-4">
                        Sign up
                      </Link>
                    </div>
                  </div>
                </form>
              </Form>
              <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary">
                By clicking continue, you agree to our <a href="#">Terms of Service</a> and{" "}
                <a href="#">Privacy Policy</a>.
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <img
          src="https://media.daily.dev/image/upload/s--r2ffZPB4--/f_auto/v1716969841/dailydev_where_developers_suffer_together_sfvfog"
          alt="Background"
          className="absolute inset-0 size-full object-cover"
        />
      </div>
    </div>
  )
}

export default SignIn

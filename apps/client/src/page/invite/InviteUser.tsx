import { Link, useNavigate, useParams } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Logo from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { BASE_ROUTE } from "@/routes/common/routePaths"
import useAuth from "@/hooks/api/use-auth"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { invitedUserJoinWorkspaceMutationFn } from "@/lib/api"
import { toast } from "sonner"

const InviteUser = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const param = useParams()
  const inviteCode = param.inviteCode as string

  const { data: authData, isPending } = useAuth()
  const user = authData?.user

  const { mutate, isPending: isLoading } = useMutation({
    mutationFn: invitedUserJoinWorkspaceMutationFn,
  })

  const returnUrl = encodeURIComponent(
    `${BASE_ROUTE.INVITE_URL.replace(":inviteCode", inviteCode)}`,
  )

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault()
    mutate(inviteCode, {
      onSuccess: (data) => {
        queryClient.resetQueries({
          queryKey: ["userWorkspaces"],
        })
        navigate(`/workspace/${data.workspaceId}`)
      },
      onError: (error) => {
        toast.error(error.message)
      },
    })
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-md flex-col gap-6">
        <Link to="/" className="flex items-center gap-2 self-center font-medium">
          <Logo />
          Team Sync.
        </Link>
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">
                Hey there! You're invited to join a TeamSync Workspace!
              </CardTitle>
              <CardDescription>
                Looks like you need to be logged into your TeamSync account to join this Workspace.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isPending ? (
                <div className="flex justify-center py-4">
                  <Spinner className="size-11" />
                </div>
              ) : (
                <div>
                  {user ? (
                    <div className="flex justify-center py-3">
                      <form onSubmit={handleSubmit}>
                        <Button type="submit" disabled={isLoading} className="w-full">
                          {isLoading && <Spinner data-icon="inline-start" />}
                          Join the Workspace
                        </Button>
                      </form>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 md:flex-row">
                      <Link className="flex-1" to={`/sign-up?returnUrl=${returnUrl}`}>
                        <Button className="w-full">Signup</Button>
                      </Link>
                      <Link className="flex-1" to={`/?returnUrl=${returnUrl}`}>
                        <Button variant="secondary" className="w-full border">
                          Login
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default InviteUser

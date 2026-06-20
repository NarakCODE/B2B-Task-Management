import { useState, useEffect } from "react";
import { useAuthContext } from "@/context/auth-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getAvatarColor, getAvatarFallbackText } from "@/lib/helper";
import { format } from "date-fns";
import { useMutation } from "@tanstack/react-query";
import { updateProfileMutationFn } from "@/lib/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import PageContainer from "@/components/resuable/page-container";

const Profile = () => {
  const { user, isLoading, refetchAuth } = useAuthContext();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [profilePicture, setProfilePicture] = useState("");

  // Sync state with user data
  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(user.name);
       
      setProfilePicture(user.profilePicture || "");
    }
  }, [user]);

  const { mutate: updateProfile, isPending } = useMutation({
    mutationFn: updateProfileMutationFn,
    onSuccess: (res) => {
      toast.success(res.message || "Profile updated successfully!");
      refetchAuth();
      setIsEditing(false);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update profile.");
    },
  });

  if (isLoading) {
    return (
      <PageContainer className="py-8 space-y-6">
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </PageContainer>
    );
  }

  if (!user) return null;

  const initials = getAvatarFallbackText(user.name);
  const avatarColor = getAvatarColor(user.name);

  const handleCancel = () => {
    setName(user.name);
    setProfilePicture(user.profilePicture || "");
    setIsEditing(false);
  };

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("Name cannot be empty.");
      return;
    }
    updateProfile({
      name: name.trim(),
      profilePicture: profilePicture.trim() || null,
    });
  };

  return (
    <PageContainer className="py-8">
      <div className="flex items-center gap-5 mb-10">
        <Avatar className="h-16 w-16">
          <AvatarImage src={user.profilePicture || ""} alt={user.name} />
          <AvatarFallback className={`${avatarColor} text-lg`}>
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{user.name}</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
        <div>
          <h2 className="text-balance font-semibold text-foreground">
            Personal information
          </h2>
          <p className="text-pretty mt-1 text-sm leading-6 text-muted-foreground">
            Your account details and profile information.
          </p>
        </div>
        <div className="sm:max-w-3xl md:col-span-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
            <div className="col-span-full sm:col-span-3">
              <Field className="gap-2">
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <Input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  readOnly={!isEditing}
                  className={isEditing ? "border-primary focus-visible:ring-primary" : ""}
                />
              </Field>
            </div>
            <div className="col-span-full sm:col-span-3">
              <Field className="gap-2">
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  type="email"
                  id="email"
                  value={user.email}
                  readOnly
                  className="bg-muted/50 cursor-not-allowed"
                />
              </Field>
            </div>

            {isEditing && (
              <div className="col-span-full">
                <Field className="gap-2">
                  <FieldLabel htmlFor="profilePicture">Profile Picture URL</FieldLabel>
                  <Input
                    type="text"
                    id="profilePicture"
                    placeholder="https://example.com/avatar.png"
                    value={profilePicture}
                    onChange={(e) => setProfilePicture(e.target.value)}
                    className="border-primary focus-visible:ring-primary"
                  />
                  <FieldDescription>
                    Provide a public URL to update your avatar image.
                  </FieldDescription>
                </Field>
              </div>
            )}

            <div className="col-span-full sm:col-span-3">
              <Field className="gap-2">
                <FieldLabel htmlFor="member-since">Member since</FieldLabel>
                <Input
                  type="text"
                  id="member-since"
                  value={user.createdAt ? format(new Date(user.createdAt), "PPP") : ""}
                  readOnly
                  className="bg-muted/50 cursor-not-allowed"
                />
              </Field>
            </div>
            <div className="col-span-full sm:col-span-3">
              <Field className="gap-2">
                <FieldLabel htmlFor="last-login">Last login</FieldLabel>
                <Input
                  type="text"
                  id="last-login"
                  value={
                    user.lastLogin
                      ? format(new Date(user.lastLogin), "PPP")
                      : "First login"
                  }
                  readOnly
                  className="bg-muted/50 cursor-not-allowed"
                />
              </Field>
            </div>
            <div className="col-span-full sm:col-span-3">
              <Field className="gap-2">
                <FieldLabel htmlFor="status">Account status</FieldLabel>
                <div className="flex h-10 items-center">
                  <Badge
                    variant={user.isActive ? "default" : "destructive"}
                    className="capitalize"
                  >
                    {user.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </Field>
            </div>
          </div>
        </div>
      </div>

      <Separator className="my-8" />

      {user.currentWorkspace && (
        <>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
            <div>
              <h2 className="text-balance font-semibold text-foreground">
                Current Workspace
              </h2>
              <p className="text-pretty mt-1 text-sm leading-6 text-muted-foreground">
                Your active workspace details.
              </p>
            </div>
            <div className="sm:max-w-3xl md:col-span-2">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
                <div className="col-span-full sm:col-span-3">
                  <Field className="gap-2">
                    <FieldLabel htmlFor="workspace-name">Workspace</FieldLabel>
                    <Input
                      type="text"
                      id="workspace-name"
                      value={user.currentWorkspace.name}
                      readOnly
                      className="bg-muted/50 cursor-not-allowed"
                    />
                  </Field>
                </div>
                <div className="col-span-full sm:col-span-3">
                  <Field className="gap-2">
                    <FieldLabel htmlFor="role">Role</FieldLabel>
                    <Input
                      type="text"
                      id="role"
                      value="Owner"
                      readOnly
                      className="bg-muted/50 cursor-not-allowed"
                    />
                    <FieldDescription>
                      Your role in this workspace.
                    </FieldDescription>
                  </Field>
                </div>
                <div className="col-span-full sm:col-span-3">
                  <Field className="gap-2">
                    <FieldLabel htmlFor="invite-code">Invite Code</FieldLabel>
                    <Input
                      type="text"
                      id="invite-code"
                      value={user.currentWorkspace.inviteCode}
                      readOnly
                      className="bg-muted/50 cursor-not-allowed"
                    />
                    <FieldDescription>
                      Share this code to invite team members.
                    </FieldDescription>
                  </Field>
                </div>
              </div>
            </div>
          </div>
          <Separator className="my-8" />
        </>
      )}

      <div className="flex items-center justify-end gap-3">
        {isEditing ? (
          <>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isPending}
              className="whitespace-nowrap"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={isPending}
              className="whitespace-nowrap min-w-[100px]"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
            </Button>
          </>
        ) : (
          <Button
            type="button"
            onClick={() => setIsEditing(true)}
            className="whitespace-nowrap"
          >
            Edit Profile
          </Button>
        )}
      </div>
    </PageContainer>
  );
};

export default Profile;

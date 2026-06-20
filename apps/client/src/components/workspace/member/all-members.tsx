import { ChevronDown, Loader } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAvatarColor, getAvatarFallbackText } from "@/lib/helper";
import { useAuthContext } from "@/context/auth-provider";
import useWorkspaceId from "@/hooks/use-workspace-id";
import useGetWorkspaceMembers from "@/hooks/api/use-get-workspace-members";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { changeWorkspaceMemberRoleMutationFn } from "@/lib/api";
import { toast } from "sonner";
import { Permissions } from "@/constant";

const ROLE_RANK: Record<string, number> = {
  OWNER: 3,
  ADMIN: 2,
  MEMBER: 1,
};

const AllMembers = () => {
  const { user, hasPermission } = useAuthContext();

  const canChangeMemberRole = hasPermission(Permissions.CHANGE_MEMBER_ROLE);

  const queryClient = useQueryClient();
  const workspaceId = useWorkspaceId();

  const { data, isPending } = useGetWorkspaceMembers(workspaceId);
  const members = data?.members || [];
  const roles = data?.roles || [];

  const currentMember = members.find((m) => m.userId._id === user?._id);
  const currentRoleName = currentMember?.role?.name || "MEMBER";
  const currentRank = ROLE_RANK[currentRoleName] || 0;

  const { mutate, isPending: isLoading } = useMutation({
    mutationFn: changeWorkspaceMemberRoleMutationFn,
  });

  const handleSelect = (roleId: string, memberId: string) => {
    if (!roleId || !memberId) return;
    const payload = {
      workspaceId,
      data: {
        roleId,
        memberId,
      },
    };
    mutate(payload, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["members", workspaceId],
        });
        toast.success("Member's role changed successfully");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  };

  const canModifyMember = (memberRoleName: string): boolean => {
    if (!canChangeMemberRole) return false;
    const targetRank = ROLE_RANK[memberRoleName] || 0;
    return currentRank > targetRank;
  };

  const assignableRoles = roles.filter((role) => {
    if (role.name === "OWNER") return false;
    const roleRank = ROLE_RANK[role.name] || 0;
    return currentRank > roleRank;
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[70%]">Member</TableHead>
            <TableHead className="text-right">Role</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isPending ? (
            <TableRow>
              <TableCell colSpan={2} className="h-24 text-center">
                <Loader className="w-8 h-8 animate-spin mx-auto" />
              </TableCell>
            </TableRow>
          ) : members.length === 0 ? (
            <TableRow>
              <TableCell colSpan={2} className="h-24 text-center">
                No members found.
              </TableCell>
            </TableRow>
          ) : (
            members.map((member) => {
              const name = member.userId?.name;
              const initials = getAvatarFallbackText(name);
              const avatarColor = getAvatarColor(name);
              const canModify = canModifyMember(member.role.name);
              const isSelf = member.userId._id === user?._id;

              return (
                <TableRow key={member._id}>
                  <TableCell className="py-3">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={member.userId?.profilePicture || ""}
                          alt="Image"
                        />
                        <AvatarFallback className={avatarColor}>
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium leading-none">
                          {name}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {member.userId.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="ml-auto min-w-24 capitalize disabled:opacity-95 disabled:pointer-events-none"
                            disabled={isLoading || !canModify || isSelf}
                          >
                            {member.role.name?.toLowerCase()}{" "}
                            {canModify && !isSelf && (
                              <ChevronDown className="text-muted-foreground" />
                            )}
                          </Button>
                        </PopoverTrigger>
                        {canModify && (
                          <PopoverContent className="p-0" align="end">
                            <Command>
                              <CommandInput
                                placeholder="Select new role..."
                                disabled={isLoading}
                                className="disabled:pointer-events-none"
                              />
                              <CommandList>
                                {isLoading ? (
                                  <Loader className="w-8 h-8 animate-spin place-self-center flex my-4" />
                                ) : (
                                  <>
                                    <CommandEmpty>No roles found.</CommandEmpty>
                                    <CommandGroup>
                                      {assignableRoles.map((role) => (
                                        <CommandItem
                                          key={role._id}
                                          disabled={isLoading}
                                          className="disabled:pointer-events-none gap-1 mb-1  flex flex-col items-start px-4 py-2 cursor-pointer"
                                          onSelect={() => {
                                            handleSelect(
                                              role._id,
                                              member.userId._id,
                                            );
                                          }}
                                        >
                                          <p className="capitalize">
                                            {role.name?.toLowerCase()}
                                          </p>
                                          <p className="text-sm text-muted-foreground">
                                            {role.name === "ADMIN" &&
                                              `Can view, create, edit tasks, project and manage settings .`}

                                            {role.name === "MEMBER" &&
                                              `Can view,edit only task created by.`}
                                          </p>
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </>
                                )}
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        )}
                      </Popover>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default AllMembers;

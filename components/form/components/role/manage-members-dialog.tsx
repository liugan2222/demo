"use client"

import type * as React from "react"
import { useState, useEffect } from "react"
import { X, Search } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"

import { userToRole } from '@/lib/api';

interface User {
  username: string
  firstName: string
  lastName: string
}

interface ManageMembersDialogProps {
  roleId: string
  users: User[]
  selectedUsers: string[]
  onSelectedUsersChange: (users: string[]) => void
  trigger?: React.ReactNode
}

export function ManageMembersDialog({
  roleId,
  users,
  selectedUsers,
  onSelectedUsersChange,
  trigger,
}: ManageMembersDialogProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [localSelectedUsers, setLocalSelectedUsers] = useState<string[]>(selectedUsers)

  // Reset local state when dialog opens
  useEffect(() => {
    if (open) {
      setLocalSelectedUsers(selectedUsers)
    }
  }, [open, selectedUsers])

  const filteredUsers = users.filter(
    (user) =>
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleUserToggle = (username: string) => {
    setLocalSelectedUsers((prev) =>
      prev.includes(username) ? prev.filter((id) => id !== username) : [...prev, username],
    )
  }

  const handleRemoveUser = (username: string) => {
    setLocalSelectedUsers((prev) => prev.filter((id) => id !== username))
  }

  const handleClearSelections = () => {
    setLocalSelectedUsers([])
  }

  const handleSave = () => {
    userToRole(roleId, localSelectedUsers)
    onSelectedUsersChange(localSelectedUsers)
    setOpen(false)
  }

  const getSelectedUserObjects = () => {
    return users.filter((user) => localSelectedUsers.includes(user.username))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="default">
            Manage members
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>Manage role members</DialogTitle>
          <DialogDescription>
            Assign users to this role. Users will inherit all permissions from this role.
          </DialogDescription>
        </DialogHeader>
        <div className="flex h-[500px] border-t">
          {/* Left side - Available users */}
          <div className="w-1/2 border-r p-4 flex flex-col">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search user"
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <h3 className="text-sm font-medium mb-2">Available users</h3>
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-1">
                {filteredUsers.map((user) => (
                  <div
                    key={user.username}
                    className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent cursor-pointer"
                    onClick={() => handleUserToggle(user.username)}
                  >
                    {/* <Checkbox
                      checked={localSelectedUsers.includes(user.username)}
                      onCheckedChange={() => handleUserToggle(user.username)}
                    /> */}
                    <div onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={localSelectedUsers.includes(user.username)}
                        onCheckedChange={() => handleUserToggle(user.username)}
                      />
                    </div>
                    <span>
                      {user.firstName} {user.lastName}
                    </span>
                  </div>
                ))}
                {filteredUsers.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">No users found</div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Right side - Assigned members */}
          <div className="w-1/2 p-4 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium">Assigned members</h3>
              <Badge variant="outline" className="font-normal">
                {localSelectedUsers.length} selected
              </Badge>
            </div>
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-2">
                {getSelectedUserObjects().map((user) => (
                  <div
                    key={user.username}
                    className="flex items-center justify-between p-2 rounded-md bg-accent/50"
                  >
                    <span>
                      {user.firstName} {user.lastName}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleRemoveUser(user.username)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {localSelectedUsers.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">No members assigned</div>
                )}
              </div>
            </ScrollArea>
            {localSelectedUsers.length > 0 && (
              <Button
                variant="ghost"
                className="mt-2 justify-start text-muted-foreground text-green-700"
                onClick={handleClearSelections}
              >
                Clear selections
              </Button>
            )}
          </div>
        </div>
        <div className="flex justify-end space-x-2 p-4 border-t">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}


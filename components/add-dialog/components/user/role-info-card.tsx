import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Permission {
  [key: string]: string[]
}

interface RoleInfoCardProps {
  label: string
  description: string
  permissions: Permission
  className?: string
}

export function RoleInfoCard({ label, description, permissions, className }: RoleInfoCardProps) {
  return (
    <Card className={cn("z-[200] bg-background", className)}>
      <CardContent className="p-4 space-y-4">
        <div>
          <h4 className="font-semibold text-base">{label}</h4>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
        <div className="space-y-2">
          <h5 className="text-sm font-medium">Permissions</h5>
          <div className="space-y-2">
            {Object.entries(permissions).map(([category, perms]) => (
              <div key={category} className="space-y-1">
                <div className="text-sm text-muted-foreground">{category}</div>
                <div className="flex flex-wrap gap-1">
                  {perms.map((perm) => (
                    <Badge key={perm} variant="secondary" className="text-xs font-normal">
                      {perm}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


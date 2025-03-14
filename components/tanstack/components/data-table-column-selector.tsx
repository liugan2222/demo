"use client"

import * as React from "react"
import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CirclePlus } from "lucide-react"

interface DataTableColumnSelectorProps {
  columns: {
    label: string
    value: string
    disabled?: boolean
  }[]
  onSelect: (value: string) => void
}

export function DataTableColumnSelector({
  columns,
  onSelect,
}: DataTableColumnSelectorProps) {
  const [open, setOpen] = React.useState(false)

  const uniqueColumns = useMemo(() => {
    const uniqueMap = new Map();
    columns.forEach(column => {
      if (!uniqueMap.has(column.value)) {
        uniqueMap.set(column.value, column);
      }
    });
    return Array.from(uniqueMap.values());
  }, [columns]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8">
          <CirclePlus size={16} className="h-4 w-4" />
          Filter
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search columns..." />
          <CommandList>
            <CommandEmpty>No columns found.</CommandEmpty>
            <CommandGroup>
              {uniqueColumns.map((column) => (
                <CommandItem
                  key={column.value}
                  onSelect={() => {
                    onSelect(column.value)
                    setOpen(false)
                  }}
                  disabled={column.disabled}
                  className={column.disabled ? "opacity-50" : ""}
                >
                  {column.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
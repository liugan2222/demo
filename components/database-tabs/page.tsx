"use client"

import * as React from "react"

import {DatabaseItems} from "@/components/database-tabs/database-items/page"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

const tabItems = [
  { value: "raw", label: "Raw" },
  { value: "product", label: "Product" },
  { value: "rac-wip", label: "RAC WIP" },
  { value: "rte-wip", label: "RTE WIP" },
  { value: "packed-wip", label: "Packed WIP" },
]

export function DatabaseTabs() {
  return (
    <Tabs defaultValue="raw" className="w-full">
      <TabsList className="h-[42px] p-[5px] bg-slate-100 rounded-md justify-start items-start inline-flex">
        {tabItems.map((item) => (
          <TabsTrigger
            key={item.value}
            value={item.value}
            className="px-3 py-1.5 rounded-[3px] justify-start items-start gap-2.5 flex data-[state=active]:bg-white"
          >
            <span className="text-sm font-medium font-['Inter'] leading-tight data-[state=active]:text-slate-900 text-slate-700">
              {item.label}
            </span>
          </TabsTrigger>
        ))}
      </TabsList>
      {tabItems.map((item) => (
        <TabsContent key={item.value} value={item.value}>
          {
            item.value === "raw" ? <DatabaseItems />
              : (
                <div className="p-4">
                  <h2 className="text-lg font-semibold mb-2">{item.label} Content</h2>
                  <p>This is the content for the {item.label} tab.</p>
                </div>
              )
          }
        </TabsContent>
      ))}
    </Tabs>
  )
}

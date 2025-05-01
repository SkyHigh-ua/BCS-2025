import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/card";
import { Separator } from "@/ui/separator";
import { Table, TableBody, TableCell, TableRow } from "@/ui/table";
import { MoreHorizontal } from "lucide-react";

// Site Info Widget
export function SiteInfoWidget(): JSX.Element {
  const siteInfoData = [
    { label: "WordPress Version", value: "6.0" },
    { label: "Debug Mode", value: "Disabled" },
    { label: "PHP Version", value: "7.4.29" },
    { label: "PHP Memory Limit", value: "512M" },
    { label: "MySQL Version", value: "10.5.15-MariaDB-cll-lve" },
    { label: "Server IP", value: "185.166.188.30" },
    { label: "Site Health", value: "Should be improved", status: "warning" },
    { label: "Domain expired", value: "August 20, 2025" },
    { label: "SSL expires", value: "October 04, 2025" },
  ];

  return (
    <Card className="w-[380px] shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-foreground">Site info</CardTitle>
            <CardDescription>
              Basic child site system information
            </CardDescription>
          </div>
          <div className="w-[21px] h-[21px] flex items-center justify-center bg-white rounded-md">
            <MoreHorizontal className="h-4 w-4" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-8">
        <Table>
          <TableBody>
            {siteInfoData.map((item, index) => (
              <TableRow key={index} className="border-b">
                <TableCell className="font-medium text-sm text-foreground py-4">
                  {item.label}
                </TableCell>
                <TableCell className="text-right text-sm py-4">
                  {item.status === "warning" ? (
                    <span className="text-[#ff4800]">{item.value}</span>
                  ) : (
                    item.value
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// Domain Info Widget
export function DomainInfoWidget(): JSX.Element {
  const domainInfoData = [
    { label: "Domain", value: "testsite1.com" },
    { label: "Status", value: "registered" },
    { label: "Create Date", value: "1997-11-03 00:00:00" },
    { label: "Update Date", value: "2024-10-29 01:25:57" },
    { label: "Expire Date", value: "2025-11-02 05:00:00Z" },
    { label: "Registar", value: "DOMAINS, INC" },
    {
      label: "Nameservices",
      value: "ns1.greendotdns.com\nns2.greendotdns.com",
      multiline: true,
    },
  ];

  return (
    <Card className="w-[380px] shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-foreground">Domain info</CardTitle>
            <CardDescription>
              Domain Profile (Last check: April 23, 2025 5:09 am)
            </CardDescription>
          </div>
          <div className="w-[21px] h-[21px] flex items-center justify-center bg-white rounded-md">
            <MoreHorizontal className="h-4 w-4" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-8">
        <Table>
          <TableBody>
            {domainInfoData.map((item, index) => (
              <TableRow key={index} className="border-b">
                <TableCell className="font-medium text-sm text-foreground py-4">
                  {item.label}
                </TableCell>
                <TableCell className="text-right text-sm py-4">
                  {item.multiline ? (
                    <div className="whitespace-pre-line">{item.value}</div>
                  ) : (
                    item.value
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// Uptime Widget
export function UptimeWidget(): JSX.Element {
  const uptimeData = {
    overall: "98.42%",
    last24Hours: "100.00%",
    last7Days: "100.00%",
    last30Days: "98.17%",
  };

  const chartData = [
    1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1,
    1, 1, 1, 1, 1,
  ];

  return (
    <Card className="w-[398px] shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-foreground">
              Uptime Last 30 days
            </CardTitle>
            <CardDescription>
              Monitor site uptime status and response time history.
            </CardDescription>
          </div>
          <div className="w-[21px] h-[21px] flex items-center justify-center bg-white rounded-md">
            <MoreHorizontal className="h-4 w-4" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-muted-foreground">Overall Uptime</div>
          <div className="text-sm text-[#22c55e]">{uptimeData.overall}</div>
        </div>
        <Separator className="mb-4" />

        {/* Uptime Chart */}
        <div className="flex items-end justify-around h-[34px] gap-[3px] mb-6">
          {chartData.map((status, index) => (
            <div
              key={index}
              className={`w-[8.3px] h-[33.7px] rounded-sm ${
                status === 1 ? "bg-[#22c55e]" : "bg-red-500"
              }`}
            />
          ))}
        </div>

        {/* Uptime Stats */}
        <div className="flex justify-between items-center">
          <div className="text-center">
            <div className="text-xl font-bold">{uptimeData.last24Hours}</div>
            <div className="text-xs">Last 24 hours</div>
          </div>

          <div className="text-center">
            <div className="text-xl font-bold">{uptimeData.last7Days}</div>
            <div className="text-xs">Last 7 days</div>
          </div>

          <div className="text-center">
            <div className="text-xl font-bold">{uptimeData.last30Days}</div>
            <div className="text-xs">Last 30 days</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

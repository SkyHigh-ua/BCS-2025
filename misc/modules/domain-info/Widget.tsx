(props) => {
  const { UIComponents, LucidReact, data } = props;
  const { CardHeader, CardTitle, CardDescription, CardContent } = UIComponents;
  const { Table, TableBody, TableRow, TableCell } = UIComponents;
  const { MoreHorizontal } = LucidReact;
  const domainInfoData = data?.domainInfoData || [
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
    <>
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
    </>
  );
};

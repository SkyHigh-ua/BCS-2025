(props) => {
  const { UIComponents, LucidReact, data } = props;
  const { CardHeader, CardTitle, CardDescription, CardContent } = UIComponents;
  const { Table, TableBody, TableRow, TableCell } = UIComponents;
  const { MoreHorizontal } = LucidReact;
  const siteInfoData = data?.siteInfoData || [
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
    <>
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
    </>
  );
};

(props) => {
  const { UIComponents, LucidReact, data } = props;
  const { Card, CardHeader, CardTitle, CardDescription, CardContent } =
    UIComponents;
  const { MoreHorizontal } = LucidReact;
  const { Separator } = UIComponents;
  const chartData = data;
  const uptimeData = {
    overall: chartData / chartData.length,
    last24Hours: "100.00%",
    last7Days: "100.00%",
    last30Days: "98.17%",
  };

  // const chartData = [
  // 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1,
  // 1, 1, 1, 1, 1,
  // ];

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
};

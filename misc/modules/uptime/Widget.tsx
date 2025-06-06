(props) => {
  const { UIComponents, LucidReact, data } = props;
  const { CardHeader, CardTitle, CardDescription, CardContent } = UIComponents;
  const { MoreHorizontal } = LucidReact;
  const { Separator } = UIComponents;
  const chartData = data?.uptimeData || [];
  const uptimeStats = data?.uptimeStats || {
    overall: "0.00%",
    last24Hours: "0.00%",
    last7Days: "0.00%",
    last30Days: "0.00%",
  };

  return (
    <>
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
          <div
            className="flex items-center justify-center bg-white rounded-md"
            style={{ width: "21px", height: "21px" }}
          >
            <MoreHorizontal className="h-4 w-4" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-muted-foreground">Overall Uptime</div>
          <div className="text-sm" style={{ color: "#22c55e" }}>
            {uptimeStats.overall}
          </div>
        </div>
        <Separator className="mb-4" />

        {/* Uptime Chart */}
        <div
          className="flex items-end justify-around mb-6"
          style={{ gap: "3px", height: "34px" }}
        >
          {chartData.map((status, index) => (
            <div
              key={index}
              className="rounded-sm"
              style={{
                width: "8.3px",
                height: "33.7px",
                backgroundColor: status === 1 ? "#22c55e" : "#ef4444",
              }}
            />
          ))}
        </div>

        {/* Uptime Stats */}
        <div className="flex justify-between items-center">
          <div className="text-center">
            <div className="text-xl font-bold">{uptimeStats.last24Hours}</div>
            <div className="text-xs">Last 24 hours</div>
          </div>

          <div className="text-center">
            <div className="text-xl font-bold">{uptimeStats.last7Days}</div>
            <div className="text-xs">Last 7 days</div>
          </div>

          <div className="text-center">
            <div className="text-xl font-bold">{uptimeStats.last30Days}</div>
            <div className="text-xs">Last 30 days</div>
          </div>
        </div>
      </CardContent>
    </>
  );
};

import { useEffect, useState } from "react";
import { Bar, Line } from "react-chartjs-2";
import { profitCM, refBarChart, refBarChart4, refBarChartSet2, refBarChartSet3 } from "./PanelChartData";

export const ReferralCharts = ({ state }) => {
  const [data, setData] = useState(refBarChart);
  useEffect(() => {
    let object;
    if (state === "7") {
      object = refBarChartSet2;
    } else if (state === "15") {
      object = refBarChartSet3;
    } else {
      object = refBarChart4;
    }
    setData(object);
  }, [state]);
  return (
    <Bar
      data={data}
      className="chart-refer-stats chartjs-render-monitor"
      options={{
        legend: {
          display: false,
        },
        maintainAspectRatio: false,
        tooltips: {
          enabled: true,
          callbacks: {
            title: function (tooltipItem, data) {
              return false;
            },
            label: function (tooltipItem, data) {
              return `${data.datasets[tooltipItem.datasetIndex]["data"][tooltipItem["index"]]} people`;
            },
          },
          backgroundColor: "#fff",
          titleFontSize: 11,
          titleFontColor: "#6783b8",
          titleMarginBottom: 4,
          bodyFontColor: "#9eaecf",
          bodyFontSize: 10,
          bodySpacing: 3,
          yPadding: 8,
          xPadding: 8,
          footerMarginTop: 0,
          displayColors: false,
        },
        scales: {
          yAxes: [
            {
              display: false,
              ticks: {
                beginAtZero: true,
              },
            },
          ],
          xAxes: [
            {
              display: false,
            },
          ],
        },
      }}
    />
  );
};

export const ProfitCharts = () => (
  <Line
    data={profitCM}
    options={{
      legend: {
        display: false,
      },
      maintainAspectRatio: false,
      tooltips: {
        enabled: true,
        callbacks: {
          title: function (tooltipItem, data) {
            return false;
          },
          label: function (tooltipItem, data) {
            return `${data.datasets[tooltipItem.datasetIndex]["data"][tooltipItem["index"]]} USD`;
          },
        },
        backgroundColor: "#fff",
        titleFontSize: 11,
        titleFontColor: "#6783b8",
        titleMarginBottom: 4,
        bodyFontColor: "#9eaecf",
        bodyFontSize: 10,
        bodySpacing: 3,
        yPadding: 8,
        xPadding: 8,
        footerMarginTop: 0,
        displayColors: false,
      },
      scales: {
        yAxes: [
          {
            display: false,
            ticks: {
              beginAtZero: true,
            },
          },
        ],
        xAxes: [
          {
            display: false,
          },
        ],
      },
    }}
  />
);

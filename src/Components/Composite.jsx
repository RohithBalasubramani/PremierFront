import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  TimeScale,
  Title,
  Tooltip,
  Legend,
  registerables,
} from "chart.js";
import axios from "axios";
import "./realtimestyle.css"; // Import the shared CSS file
import "chartjs-adapter-date-fns";
import SideBarInfo from "../sidbarInfo";
import sidbarInfo from "../sidbarInfo";
import { useLocation } from "react-router-dom";

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  TimeScale,
  Title,
  Tooltip,
  Legend,
  ...registerables
);

const RealTimeChart = ({ apiKey }) => {
  const [data, setData] = useState([]);
  const [powerStatus, setPowerStatus] = useState("Loading...");
  const [activeData, setActiveData] = useState([]);
  const location = useLocation();
  // Fetch data from APIs
  const fetchData = async () => {
    const currentTime = new Date().toISOString();
    const params = {
      start_date_time: new Date(Date.now() - 60000).toISOString(), // last one minute
      end_date_time: currentTime,
      resample_period: "T", // per minute
    };
    try {
      if (sidbarInfo.apiUrls[apiKey]?.apiUrl) {
        const response = await axios.get(sidbarInfo.apiUrls[apiKey]?.apiUrl);

        const timestamp = response.data["recent data"]["timestamp"];
        const bActiveRecent = response.data["recent data"]["b_ac_power"];
        const rActiveRecent = response.data["recent data"]["r_ac_power"];
        const yActiveRecent = response.data["recent data"]["y_ac_power"];
        const bAppRecent = response.data["recent data"]["b_app_power"];
        const rAppRecent = response.data["recent data"]["r_app_power"];
        const yAppRecent = response.data["recent data"]["y_app_power"];
        const bReactiveRecent =
          response.data["recent data"]["b_reactive_power"];
        const rReactiveRecent =
          response.data["recent data"]["r_reactive_power"];
        const yReactiveRecent =
          response.data["recent data"]["y_reactive_power"];

        updateChartData(
          timestamp,
          bActiveRecent,
          rActiveRecent,
          yActiveRecent,
          bAppRecent,
          rAppRecent,
          yAppRecent,
          bReactiveRecent,
          rReactiveRecent,
          yReactiveRecent
        );
        //updatePowerStatus(ebRecent, dgRecent, dg1s12Recent);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Update chart data
  const updateChartData = (
    timestamp,
    bActiveRecent,
    rActiveRecent,
    yActiveRecent,
    bAppRecent,
    rAppRecent,
    yAppRecent,
    bReactiveRecent,
    rReactiveRecent,
    yReactiveRecent
  ) => {
    const newEntry = {
      time: timestamp,
      bActiveRecent: bActiveRecent,
      rActiveRecent: rActiveRecent,
      yActiveRecent: yActiveRecent,
      bAppRecent: bAppRecent,
      rAppRecent: rAppRecent,
      yAppRecent: yAppRecent,
      bReactiveRecent: bReactiveRecent,
      rReactiveRecent: rReactiveRecent,
      yReactiveRecent: yReactiveRecent,
    };

    setData((prevData) => {
      const updatedData = [...prevData, newEntry];
      return updatedData.length > 15
        ? updatedData.slice(updatedData.length - 15)
        : updatedData;
    });

    // setActiveData((prevData) => {
    //   let activeEntry = { time: newEntry.time, kwh: 0 };
    //   if (newEntry.ebCurrent > 0) {
    //     activeEntry = { time: newEntry.time, kwh: newEntry.ebKw, source: "EB" };
    //   } else if (newEntry.dgCurrent > 0) {
    //     activeEntry = {
    //       time: newEntry.time,
    //       kwh: newEntry.dgKw,
    //       source: "DG2S3",
    //     };
    //   } else if (newEntry.dg1s12Current > 0) {
    //     activeEntry = {
    //       time: newEntry.time,
    //       kwh: newEntry.dg1s12Kw,
    //       source: "DG1S12",
    //     };
    //   }
    //   const updatedActiveData = [...prevData, activeEntry];
    //   return updatedActiveData.length > 15
    //     ? updatedActiveData.slice(updatedActiveData.length - 15)
    //     : updatedActiveData;
    // });
  };

  // Update power status
  const updatePowerStatus = (ebRecent, dgRecent, dg1s12Recent) => {
    if (ebRecent.average_current > 0) {
      setPowerStatus("Running on EB Power");
    } else if (dgRecent.average_current > 0) {
      setPowerStatus("Running on Generator Power (DG2S3)");
    } else if (dg1s12Recent.average_current > 0) {
      setPowerStatus("Running on Generator Power (DG1S12)");
    } else {
      setPowerStatus("No Power");
    }
  };

  // Set up data fetching interval
  useEffect(() => {
    setData([]);
    setActiveData([]);
    const interval = setInterval(() => {
      fetchData();
    }, 5000); // polling every 5 seconds

    return () => clearInterval(interval);
  }, [apiKey]);

  // Configure chart data
  const chartData = {
    labels: data.map((item) => item.time),
    datasets: [
      {
        label: "R Active",
        data: data.map((item) => item.rActiveRecent),
        borderColor: "#C72F08",
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 0,
        tension: 0.4, // Smooth line
      },
      {
        label: "Y Active",
        data: data.map((item) => item.yActiveRecent),
        borderColor: "#E6B148",
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 0,
        tension: 0.4, // Smooth line
      },
      {
        label: "B Active",
        data: data.map((item) => item.bActiveRecent),
        borderColor: "#0171DB",
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 0,
        tension: 0.4, // Smooth line
      },
      {
        label: "R App",
        data: data.map((item) => item.rAppRecent),
        borderColor: "#E45D3A",
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 0,
        tension: 0.4, // Smooth line
      },
      {
        label: "Y App",
        data: data.map((item) => item.yAppRecent),
        borderColor: "#B38A38",
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 0,
        tension: 0.4, // Smooth line
      },
      {
        label: "B App",
        data: data.map((item) => item.bAppRecentr),
        borderColor: "#0158AA",
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 0,
        tension: 0.4, // Smooth line
      },
      {
        label: "R Reactive",
        data: data.map((item) => item.rReactiveRecent),
        borderColor: "#9B2406",
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 0,
        tension: 0.4, // Smooth line
      },
      {
        label: "Y Reactive",
        data: data.map((item) => item.yReactiveRecent),
        borderColor: "#FFD173",
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 0,
        tension: 0.4, // Smooth line
      },
      {
        label: "B Reactive",
        data: data.map((item) => item.bReactiveRecent),
        borderColor: "#3498F5",
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 0,
        tension: 0.4, // Smooth line
      },
    ],
  };

  // Configure chart options
  //const maxKwh = Math.max(...activeData.map((item) => item.kwh), 0);

  const options = {
    maintainAspectRatio: false,
    scales: {
      x: {
        type: "time",
        time: {
          tooltipFormat: "ll HH:mm",
        },
        grid: {
          color: "rgba(0, 0, 0, 0.05)", // Light gray color for the grid
          borderDash: [5, 5], // Dotted line style
          borderWidth: 1, // Dotted line width
        },
      },
      y: {
        title: {
          display: true,
          text: "Power (kWh)",
        },
        //min: maxKwh - 5, // dynamically adjust the scale
        //max: maxKwh + 5, // dynamically adjust the scale
        grid: {
          color: "rgba(0, 0, 0, 0.05)", // Light gray color for the grid
          borderDash: [5, 5], // Dotted line style
          borderWidth: 1, // Dotted line width
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y + " kWh";
            }
            return label;
          },
        },
      },
      legend: {
        display: false, // Hide default legend
      },
    },
  };

  // Render the chart component
  return (
    <div className="containerchart">
      <div className="chart-cont">
        <div className="title">Energy Consumption</div>
        <div className="legend-container-two">
          <div className="legend-item">
            <span className="legend-color-box v1" />
            <span>Avg Current</span>
          </div>
          <div className="legend-item">
            <span className="legend-color-box v1" />
            <span>R phase</span>
          </div>
          <div className="legend-item">
            <span className="legend-color-box v2" />
            <span>Y phase</span>
          </div>
          <div className="legend-item">
            <span className="legend-color-box v3" />
            <span>B phase</span>
          </div>
          <div className="legend-item">
            <span className="legend-color-box v1" />
            <span>Avg Current</span>
          </div>
          <div className="legend-item">
            <span className="legend-color-box v1" />
            <span>R phase</span>
          </div>
          <div className="legend-item">
            <span className="legend-color-box v2" />
            <span>Y phase</span>
          </div>
          <div className="legend-item">
            <span className="legend-color-box v3" />
            <span>B phase</span>
          </div>
          <div className="legend-item">
            <span className="legend-color-box v3" />
            <span>B phase</span>
          </div>
        </div>
        <div className="chart-size">
          <Line data={chartData} options={options} />
        </div>
      </div>
      {/* <div className="value-cont">
        <div className="value-heading">Energy Consumption</div>
        <div className="current-value">Current Value</div>
        <div className="power-value">
          {activeData.length > 0
            ? `${activeData[activeData.length - 1].kwh.toFixed(2)} `
            : "0.00"}{" "}
          <span className="value-span">kWh</span>
        </div>
      </div> */}
    </div>
  );
};

export default RealTimeChart;
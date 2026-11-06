import "./Analytics.css";
import { useEffect, useState } from "react";
import axios from "axios";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const statusColors = ["#f5a623", "#4c9aff", "#8b70d6", "#24a36b"];

const Analytics = ({ url }) => {
  const [period, setPeriod] = useState("7days");
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);

      try {
        const response = await axios.get(
          `${url}/api/order/analytics?period=${period}`,
        );

        if (response.data.success) {
          setAnalytics(response.data.analytics);
        }
      } catch (error) {
        console.error("Analytics Error:", error);
        setAnalytics(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [url, period]);

  const formatMoney = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;
  };

  const formatChartDate = (date) => {
    if (period === "12months") {
      const [year, month] = date.split("-");
      return new Date(Number(year), Number(month) - 1).toLocaleString("en-IN", {
        month: "short",
      });
    }

    const [, month, day] = date.split("-");
    return `${day}/${month}`;
  };

  if (loading) {
    return (
      <div className="analytics-page">
        <h2>Sales & Analytics</h2>
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="analytics-page">
        <h2>Sales & Analytics</h2>
        <p>Unable to load analytics. Please check your backend API.</p>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <div>
          <h2>Sales & Analytics</h2>
          <p>Track your restaurant's performance</p>
        </div>

        <select value={period} onChange={(e) => setPeriod(e.target.value)}>
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
          <option value="12months">Last 12 Months</option>
        </select>
      </div>

      {/* SUMMARY CARDS */}
      <div className="analytics-cards">
        <div className="analytics-card">
          <div className="analytics-card-icon revenue-icon">₹</div>
          <div>
            <p>Total Revenue</p>
            <h3>{formatMoney(analytics.totalRevenue)}</h3>
            <span>From paid orders</span>
          </div>
        </div>

        <div className="analytics-card">
          <div className="analytics-card-icon orders-icon">▣</div>
          <div>
            <p>Total Orders</p>
            <h3>{analytics.totalOrders}</h3>
            <span>All orders</span>
          </div>
        </div>

        <div className="analytics-card">
          <div className="analytics-card-icon paid-icon">✓</div>
          <div>
            <p>Paid Orders</p>
            <h3>{analytics.paidOrders}</h3>
            <span>Successful payments</span>
          </div>
        </div>

        <div className="analytics-card">
          <div className="analytics-card-icon average-icon">↗</div>
          <div>
            <p>Average Order Value</p>
            <h3>{formatMoney(analytics.averageOrderValue)}</h3>
            <span>Per paid order</span>
          </div>
        </div>
      </div>

      {/* REVENUE CHART */}
      <div className="analytics-chart-card">
        <div className="analytics-section-header">
          <div>
            <h3>Revenue Overview</h3>
            <p>Revenue from successful payments</p>
          </div>
        </div>

        {analytics.sales.length === 0 ? (
          <p>No sales data available.</p>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={analytics.sales}
              margin={{ top: 15, right: 15, left: 5, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />

              <XAxis
                dataKey="date"
                tickFormatter={formatChartDate}
                tick={{ fontSize: 12 }}
              />

              <YAxis
                tickFormatter={(value) => `₹${value}`}
                tick={{ fontSize: 12 }}
              />

              <Tooltip
                labelFormatter={formatChartDate}
                formatter={(value) => [formatMoney(value), "Revenue"]}
              />

              <Bar
                dataKey="revenue"
                fill="#f07842"
                radius={[5, 5, 0, 0]}
                name="Revenue"
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* BOTTOM REPORTS */}
      <div className="analytics-bottom">
        {/* TOP PRODUCTS */}
        <div className="analytics-report-card">
          <h3>Top Selling Food Items</h3>
          <p className="report-description">
            Best-selling items based on paid orders
          </p>

          {analytics.topProducts.length === 0 ? (
            <p className="empty-report">No product sales yet.</p>
          ) : (
            <div className="top-products-list">
              {analytics.topProducts.map((product, index) => (
                <div className="top-product-row" key={product.name}>
                  <div className="product-rank">{index + 1}</div>

                  <div className="top-product-info">
                    <h4>{product.name}</h4>
                    <p>{product.quantity} items sold</p>
                  </div>

                  <strong>{formatMoney(product.revenue)}</strong>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ORDER STATUS */}
        <div className="analytics-report-card">
          <h3>Order Status Breakdown</h3>
          <p className="report-description">
            Current order status distribution
          </p>

          {analytics.statusBreakdown.length === 0 ? (
            <p className="empty-report">No orders available.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={analytics.statusBreakdown}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="45%"
                  outerRadius={85}
                  label
                >
                  {analytics.statusBreakdown.map((item, index) => (
                    <Cell
                      key={item.status}
                      fill={statusColors[index % statusColors.length]}
                    />
                  ))}
                </Pie>

                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;

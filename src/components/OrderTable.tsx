"use client";

interface Order {
  id: number;
  product: string;
  amount: number;
  status: string;
}

interface OrderTableProps {
  orders: Order[];
}

export function OrderTable({ orders }: OrderTableProps) {
  return (
    <table style={{ borderCollapse: "collapse", width: "100%" }}>
      <thead>
        <tr>
          <th style={{ textAlign: "left", padding: "0.5rem" }}>ID</th>
          <th style={{ textAlign: "left", padding: "0.5rem" }}>Product</th>
          <th style={{ textAlign: "left", padding: "0.5rem" }}>Amount</th>
          <th style={{ textAlign: "left", padding: "0.5rem" }}>Status</th>
        </tr>
      </thead>
      <tbody>
        {orders.map((order) => (
          <tr key={order.id}>
            <td style={{ padding: "0.5rem" }}>{order.id}</td>
            <td style={{ padding: "0.5rem" }}>{order.product}</td>
            <td style={{ padding: "0.5rem" }}>${order.amount.toFixed(2)}</td>
            <td style={{ padding: "0.5rem" }}>{order.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

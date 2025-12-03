import http from "k6/http";
import { sleep } from "k6";

export const options = {
  vus: 1,
  duration: "10s",
};

export default function () {
  const url = "http://localhost:3000/api/v1/transfer";
  const payload = {
    provider: "avenia",
    source: {
      amount: 100,
      currency: "brla",
    },
    destination: {
      payment_method: {
        type: "customer_wallet",
        chain: "ethereum",
        evm_address: "0x5d724E37F84cDDd876Bd8701669417F55a001B58",
      },
    },
  };
  const params = {
    headers: {
      "Content-Type": "application/json",
      Authorization:
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjoiYUlsQWlLT01LenZ6b0tNUWFKTWRORkNZdlI3QjJxMmRjc204ZXNJaHUySSUzRCIsImlhdCI6MTc2NDc1OTg5NSwiZXhwIjoxNzY0NzYzMTk1fQ.h2_OIclYHtKRChPQt4rrs3-PsvZwqihQcW54r0cqRK0",
    },
  };

  http.request("POST", url, JSON.stringify(payload), params);
  sleep(1);
}

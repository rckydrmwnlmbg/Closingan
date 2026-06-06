"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export function DashboardHeader() {
  const [greeting, setGreeting] = useState("Halo");
  const [dateStr, setDateStr] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Selamat Pagi");
    else if (hour < 15) setGreeting("Selamat Siang");
    else if (hour < 18) setGreeting("Selamat Sore");
    else setGreeting("Selamat Malam");

    setDateStr(format(new Date(), "EEEE, d MMMM yyyy", { locale: id }));
  }, []);

  return (
    <div className="mb-10">
      <h1 className="text-3xl font-semibold tracking-tight text-white">{greeting}, Seller.</h1>
      <p className="text-sm font-light text-zinc-500 mt-2 tracking-wide uppercase">{dateStr}</p>
    </div>
  );
}

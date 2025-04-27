import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { useState } from "react";

export default function Calendar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: deadlines } = useQuery({ queryKey: ["/api/deadlines"] });
  const { data: sessions } = useQuery({ queryKey: ["/api/live-sessions"] });

  return (
    <div className="bg-neutral-50 font-sans text-neutral-800 flex h-screen overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onOpenSidebar={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <h1 className="text-2xl font-semibold mb-4">Calendar</h1>
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-2">Upcoming Deadlines</h2>
            <ul className="list-disc ml-6">
              {deadlines?.map((d: any) => (
                <li key={d.id} className="mb-2">
                  <span className="font-semibold">{d.title}</span> - Due: {new Date(d.due_date).toLocaleString()}
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-bold mb-2">Live Sessions</h2>
            <ul className="list-disc ml-6">
              {sessions?.map((s: any) => (
                <li key={s.id} className="mb-2">
                  <span className="font-semibold">{s.title}</span> - {new Date(s.start_time).toLocaleString()}
                </li>
              ))}
            </ul>
          </section>
        </main>
      </div>
    </div>
  );
}

import { User } from "@/lib/mockData";

interface KPIProps {
  user: User;
}

export default function KPI({ user }: KPIProps) {
  return (
    <div>
      <h1 className="text-3xl font-bold">KPI Monitoring</h1>
      <p className="text-muted-foreground">Monitor key performance indicators for {user.fullName}</p>
    </div>
  );
}
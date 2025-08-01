import { User } from "@/lib/mockData";

interface ReportsProps {
  user: User;
}

export default function Reports({ user }: ReportsProps) {
  return (
    <div>
      <h1 className="text-3xl font-bold">Monthly Reports</h1>
      <p className="text-muted-foreground">Generate and view reports for {user.fullName}</p>
    </div>
  );
}
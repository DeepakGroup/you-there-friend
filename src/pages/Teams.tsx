import { User } from "@/lib/mockData";

interface TeamsProps {
  user: User;
}

export default function Teams({ user }: TeamsProps) {
  return (
    <div>
      <h1 className="text-3xl font-bold">Team Management</h1>
      <p className="text-muted-foreground">Manage teams and roles for {user.fullName}</p>
    </div>
  );
}
import { User } from "@/lib/mockData";

interface WorkflowProps {
  user: User;
}

export default function Workflow({ user }: WorkflowProps) {
  return (
    <div>
      <h1 className="text-3xl font-bold">Workflow Management</h1>
      <p className="text-muted-foreground">Manage approval workflows for {user.fullName}</p>
    </div>
  );
}
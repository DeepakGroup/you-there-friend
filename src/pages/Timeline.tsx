import { User } from "@/lib/mockData";

interface TimelineProps {
  user: User;
}

export default function Timeline({ user }: TimelineProps) {
  return (
    <div>
      <h1 className="text-3xl font-bold">Timeline Tracking</h1>
      <p className="text-muted-foreground">Track initiative timelines and progress for {user.fullName}</p>
    </div>
  );
}
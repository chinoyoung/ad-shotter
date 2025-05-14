interface ActivityItemProps {
  avatar?: string;
  initials?: string;
  name: string;
  action: string;
  time: string;
  iconColor?: string;
}

const ActivityItem = ({
  avatar,
  initials,
  name,
  action,
  time,
  iconColor = "bg-blue-500",
}: ActivityItemProps) => {
  return (
    <div className="flex items-start mb-3 last:mb-0">
      <div
        className={`w-7 h-7 rounded-full ${iconColor} flex items-center justify-center text-white text-xs font-medium shrink-0`}
      >
        {avatar ? (
          <img src={avatar} alt={name} className="w-full h-full rounded-full" />
        ) : (
          initials
        )}
      </div>
      <div className="ml-2">
        <p className="text-xs text-gray-800 dark:text-white">
          <span className="font-medium">{name}</span> {action}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{time}</p>
      </div>
    </div>
  );
};

export default function ActivityCard() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-medium text-gray-800 dark:text-white">
          Recent Activity
        </h3>
        <button className="text-blue-500 hover:text-blue-600 text-xs font-medium">
          View all
        </button>
      </div>

      <div>
        <ActivityItem
          initials="JD"
          name="John Doe"
          action="completed the project setup"
          time="2 hours ago"
          iconColor="bg-blue-500"
        />
        <ActivityItem
          initials="AS"
          name="Alice Smith"
          action="pushed a new commit"
          time="4 hours ago"
          iconColor="bg-purple-500"
        />
        <ActivityItem
          initials="RJ"
          name="Robert Johnson"
          action="created a new task"
          time="Yesterday at 12:34 PM"
          iconColor="bg-green-500"
        />
        <ActivityItem
          initials="ML"
          name="Mary Lee"
          action="completed the design review"
          time="Yesterday at 10:30 AM"
          iconColor="bg-orange-500"
        />
        <ActivityItem
          initials="TD"
          name="Tom Davis"
          action="assigned a task to Mary"
          time="2 days ago"
          iconColor="bg-indigo-500"
        />
      </div>
    </div>
  );
}

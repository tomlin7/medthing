import { AlertTriangle, Calendar, TrendingUp, Users } from "lucide-react";

const Dashboard = () => {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Welcome back, Foo</h2>
        <p className="text-gray-600">Here's an overview of your activities.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          {
            icon: Users,
            label: "Total Patients",
            value: "1,234",
            trend: "+12%",
            color: "blue",
          },
          {
            icon: Calendar,
            label: "Appointments Today",
            value: "8",
            trend: "+2",
            color: "green",
          },
          {
            icon: AlertTriangle,
            label: "Critical Cases",
            value: "3",
            trend: "-1",
            color: "red",
          },
          {
            icon: TrendingUp,
            label: "Follow-ups Due",
            value: "15",
            trend: "+5",
            color: "purple",
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg bg-${stat.color}-50`}>
                <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
              </div>
              <span className={`text-${stat.color}-600 text-sm font-medium`}>
                {stat.trend}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {stat.value}
            </h3>
            <p className="text-gray-600">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Patients
          </h3>
          <div className="space-y-4">
            {[
              {
                name: "Sarah Johnson",
                condition: "Hypertension",
                lastVisit: "2 days ago",
                status: "Stable",
              },
              {
                name: "Michael Chen",
                condition: "Diabetes Type 2",
                lastVisit: "1 week ago",
                status: "Review",
              },
              {
                name: "Emma Davis",
                condition: "Asthma",
                lastVisit: "3 days ago",
                status: "Critical",
              },
            ].map((patient) => (
              <div
                key={patient.name}
                className="flex items-center justify-between p-4 bg-gray-50 shadow-sm"
              >
                <div>
                  <h4 className="font-medium text-gray-900">{patient.name}</h4>
                  <p className="text-sm text-gray-500">{patient.condition}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">{patient.lastVisit}</p>
                  <span
                    className={`inline-block px-2 py-1 text-xs rounded-full ${
                      patient.status === "Critical"
                        ? "bg-red-100 text-red-600"
                        : patient.status === "Review"
                        ? "bg-yellow-100 text-yellow-600"
                        : "bg-green-100 text-green-600"
                    }`}
                  >
                    {patient.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Upcoming Follow-ups
          </h3>
          <div className="space-y-4">
            {[
              {
                name: "Robert Wilson",
                date: "Tomorrow, 10:00 AM",
                type: "Blood Pressure Check",
              },
              {
                name: "Lisa Anderson",
                date: "Mar 15, 2:30 PM",
                type: "Diabetes Review",
              },
              {
                name: "James Taylor",
                date: "Mar 16, 11:15 AM",
                type: "Post-Surgery Check",
              },
            ].map((appointment) => (
              <div
                key={appointment.name}
                className="flex items-center justify-between p-4 bg-gray-50"
              >
                <div>
                  <h4 className="font-medium text-gray-900">
                    {appointment.name}
                  </h4>
                  <p className="text-sm text-gray-500">{appointment.type}</p>
                </div>
                <p className="text-sm font-medium text-blue-600">
                  {appointment.date}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

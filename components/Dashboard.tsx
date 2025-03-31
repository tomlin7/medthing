import { AlertTriangle, Calendar, TrendingUp, Users } from "lucide-react";

const Dashboard = () => {
  return (
    <div>
      <div>
        <h2>Welcome back, Foo</h2>
        <p>Here's an overview of your activities.</p>
      </div>

      <div>
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
          <div key={stat.label}>
            <div>
              <div>
                <stat.icon />
              </div>
              <span>{stat.trend}</span>
            </div>
            <h3>{stat.value}</h3>
            <p>{stat.label}</p>
          </div>
        ))}
      </div>

      <div>
        <div>
          <h3>Recent Patients</h3>
          <div>
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
              <div key={patient.name}>
                <div>
                  <h4>{patient.name}</h4>
                  <p>{patient.condition}</p>
                </div>
                <div>
                  <p>{patient.lastVisit}</p>
                  <span>{patient.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h3>Upcoming Follow-ups</h3>
        <div>
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
          ].map((apmnt) => (
            <div key={apmnt.name}>
              <div>
                <h4>{apmnt.name}</h4>
                <p>{apmnt.type}</p>
              </div>
              <p>{apmnt.date}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

import {
  Activity,
  Bell,
  Calendar,
  Stethoscope,
  User,
  Users,
} from "lucide-react";

const Sidebar = () => {
  return (
    <div>
      <div>
        <div>
          <Stethoscope />
          <h1>SmartMed</h1>
        </div>
      </div>

      <nav>
        <div>
          {[
            { icon: Activity, label: "Dashboard" },
            { icon: Users, label: "Patients" },
            { icon: Calendar, label: "Appointments" },
            { icon: Bell, label: "Alerts" },
          ].map((item) => (
            <button key={item.label}>
              <item.icon />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <div>
        <div>
          <User />
          <div>
            <p>Foo</p>
            <p>Bar</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

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
    <div className="w-64 bg-white h-full border-r border-gray-200 flex flex-col">
      <div className="p-6">
        <div className="flex items-center gap-2">
          <Stethoscope className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">SmartMed</h1>
        </div>
      </div>

      <nav className="flex-1 px-4">
        <div className="space-y-1">
          {[
            { icon: Activity, label: "Dashboard" },
            { icon: Users, label: "Patients" },
            { icon: Calendar, label: "Appointments" },
            { icon: Bell, label: "Alerts" },
          ].map((item) => (
            <button
              key={item.label}
              className="flex items-center gap-3 px-4 py-3 text-gray-700  hover:bg-blue-200 rounded-sm hover:text-blue-700 w-full transition-colors"
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <div className="p-4   border-t border-gray-200">
        <div className="flex items-center  gap-3">
          <User className="h-10 w-10 rounded-full object-cover" />
          <div>
            <p className="font-medium text-gray-900">Foo</p>
            <p className="text-sm text-gray-500">Bar</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

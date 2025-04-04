"use client";

import { Activity, Heart, Shield, Stethoscope, Users } from "lucide-react";
import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Stethoscope className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">SmartMed</span>
          </div>
          <div className="space-x-4">
            <Link to="/login" className="text-gray-600 hover:text-blue-600">
              Login
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Empowering Rural Healthcare
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          SmartMed helps rural doctors manage patient care efficiently with
          smart analytics and easy-to-use digital health records.
        </p>
        <div className="flex justify-center space-x-4">
          <Link
            to="/signup"
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold"
          >
            Get Started
          </Link>
          <a
            href="#features"
            className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-lg font-semibold"
          >
            Learn More
          </a>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Why Choose SmartMed?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: Heart,
              title: "Patient-Centric Care",
              description:
                "Keep all your patient records in one secure place, accessible whenever you need them.",
            },
            {
              icon: Activity,
              title: "Smart Analytics",
              description:
                "Get AI-powered insights and early warning signs for better decision making.",
            },
            {
              icon: Users,
              title: "Easy Follow-ups",
              description:
                "Automated reminders and scheduling to ensure continuous patient care.",
            },
            {
              icon: Shield,
              title: "Secure & Private",
              description:
                "Your data is protected with enterprise-grade security and encryption.",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Practice?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of rural doctors using SmartMed to improve patient
            care.
          </p>
          <Link
            to="/signup"
            className="px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-lg font-semibold"
          >
            Start Free Trial
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Stethoscope className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">SmartMed</span>
          </div>
          <div className="text-gray-600">
            © 2024 SmartMed. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

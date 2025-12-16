import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Network,
  Target,
  Clock,
  UserPlus,
  Calendar,
  DollarSign,
  Menu,
  X,
  ChevronRight,
  Sparkles,
} from "lucide-react";

// MODULE DATA WITH ROUTES
const modules = [
  {
    name: "Employee Profile",
    desc: "Centralized employee records, documents, contracts, and master data.",
    icon: <Users className="w-8 h-8" />,
    gradient: "from-blue-500 to-cyan-500",
    route: "/subsystems/employee-profile",
  },
  {
    name: "Leaves Management",
    desc: "Leave types, balances, accruals, requests, approvals, and policy automation.",
    icon: <Calendar className="w-8 h-8" />,
    gradient: "from-cyan-500 to-teal-500",
    route: "/subsystems/leaves",
  },
  {
    name: "Payroll Configuration",
    desc: "Salary structures, allowances, deductions, tax rules, and payroll settings.",
    icon: <DollarSign className="w-8 h-8" />,
    gradient: "from-blue-600 to-indigo-600",
    route: "/subsystems/payroll-configuration",
  },
  {
    name: "Payroll Execution",
    desc: "Payroll cycle processing, run generation, validations, and salary calculations.",
    icon: <Clock className="w-8 h-8" />,
    gradient: "from-indigo-500 to-purple-500",
    route: "/subsystems/payroll-execution",
  },
  {
    name: "Payroll Tracking",
    desc: "History tracking, pay slips, audit logs, and payroll reports.",
    icon: <Target className="w-8 h-8" />,
    gradient: "from-purple-500 to-pink-500",
    route: "/subsystems/payroll-tracking",
  },
  {
    name: "Recruitment",
    desc: "Job posting, applicant tracking, interviews, evaluations, and hiring pipeline.",
    icon: <UserPlus className="w-8 h-8" />,
    gradient: "from-blue-500 to-indigo-500",
    route: "/subsystems/recruitment",
  },
  {
    name: "Time Management",
    desc: "Attendance, overtime, shifts, schedules, and time exception handling.",
    icon: <Clock className="w-8 h-8" />,
    gradient: "from-teal-500 to-emerald-500",
    route: "/subsystems/time-management",
  },
];

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white overflow-hidden">

      {/* NAVBAR */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-slate-950/80 backdrop-blur-xl shadow-2xl shadow-blue-900/20"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex justify-between items-center py-5">

            {/* LOGO */}
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl blur-md" />
                <div className="relative bg-gradient-to-br from-blue-600 to-cyan-600 p-2.5 rounded-xl">
                  <Sparkles className="w-6 h-6" />
                </div>
              </div>
              <h1 className="text-2xl bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                HR System
              </h1>
            </div>

            {/* DESKTOP NAV */}
            <div className="hidden lg:flex items-center gap-8">
              {["home", "modules", "about", "footer"].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollTo(item)}
                  className="text-gray-300 hover:text-white relative group"
                >
                  {item[0].toUpperCase() + item.slice(1)}
                  <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 group-hover:w-full transition-all" />
                </button>
              ))}
            </div>

            {/* LOGIN */}
            <div className="hidden lg:block">
              <Link href="/login">
                <button className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl blur-sm group-hover:blur-md transition-all" />
                  <div className="relative px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl flex items-center gap-2">
                    Login
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </button>
              </Link>
            </div>

            {/* MOBILE MENU BUTTON */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden text-gray-300"
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </nav>

      {/* MODULES */}
      <section id="modules" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {modules.map((m) => (
              <Link key={m.name} href={m.route}>
                <div className="group relative cursor-pointer">
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${m.gradient} blur-xl rounded-3xl opacity-0 group-hover:opacity-30 transition-all`}
                  />
                  <div className="relative bg-white/5 border border-white/10 p-6 rounded-3xl hover:border-white/20 transition-all hover:-translate-y-2">
                    <div className="relative mb-4">
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${m.gradient} rounded-2xl blur-md opacity-50`}
                      />
                      <div
                        className={`relative bg-gradient-to-br ${m.gradient} p-3 rounded-2xl`}
                      >
                        {m.icon}
                      </div>
                    </div>
                    <h4 className="text-xl mb-3">{m.name}</h4>
                    <p className="text-gray-400 text-sm">{m.desc}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="footer" className="py-12 text-center text-gray-400">
        © 2025 GIU HR Management System
      </footer>
    </div>
  );
}

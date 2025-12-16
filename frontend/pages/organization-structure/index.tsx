import Link from "next/link";
import { Building2, Briefcase, Network } from "lucide-react";

export default function OrganizationHome() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-light mb-2">Organization Structure</h1>
        <p className="text-white/70 mb-10">
          Manage departments, positions, and reporting structure
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Departments */}
          <Link href="/organization-structure/departments">
            <div className="cursor-pointer rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition p-6">
              <Building2 className="w-8 h-8 mb-4" />
              <h2 className="text-xl">Departments</h2>
              <p className="text-white/70 text-sm mt-2">
                Create and manage departments
              </p>
            </div>
          </Link>

          {/* Positions */}
          <Link href="/organization-structure/positions">
            <div className="cursor-pointer rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition p-6">
              <Briefcase className="w-8 h-8 mb-4" />
              <h2 className="text-xl">Positions</h2>
              <p className="text-white/70 text-sm mt-2">
                Manage job positions and titles
              </p>
            </div>
          </Link>

          {/* Org Chart */}
          <Link href="/organization-structure/org-chart">
            <div className="cursor-pointer rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition p-6">
              <Network className="w-8 h-8 mb-4" />
              <h2 className="text-xl">Org Chart</h2>
              <p className="text-white/70 text-sm mt-2">
                View reporting structure
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

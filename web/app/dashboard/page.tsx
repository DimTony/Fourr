/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useEffect } from "react";
import {
  TrendingUp,
  Users,
  FileText,
  Activity,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { getProfile } from "../services/profiles.service";
// import { apiRequest, fetchProfiles, ProfileFilters } from "@/lib/api";

const Dashboard = () => {
  const metrics = [
    {
      label: "Total Users",
      value: "2,543",
      change: "+12.5%",
      icon: <Users size={24} />,
      color: "bg-blue-500",
    },
    {
      label: "Active Sessions",
      value: "1,234",
      change: "+5.2%",
      icon: <Activity size={24} />,
      color: "bg-green-500",
    },
    {
      label: "Documents",
      value: "8,921",
      change: "+18.3%",
      icon: <FileText size={24} />,
      color: "bg-purple-500",
    },
    {
      label: "Growth Rate",
      value: "23.4%",
      change: "+3.1%",
      icon: <TrendingUp size={24} />,
      color: "bg-orange-500",
    },
  ];
// getProfile
  const [filters, setFilters] = React.useState<any>({
  // const [filters, setFilters] = React.useState<ProfileFilters>({
    page: 1,
    limit: 10,
    sort_by: "created_at",
    order: "asc",
  });

  const [profiles, setProfiles] = React.useState<any[]>([]);

  useEffect(() => {
    const searchProfiles = async () => {
      try {
        const data: any = await getProfile(
          "019dd64e-96e1-7fd0-9f4f-3b200cad87af",
        );
        // const data: any = await fetchProfiles(filters);
        console.log("Fetched profiles:", data);
        setProfiles(data);
      } catch (err) {
        console.error(err);
      }
    };

    searchProfiles();
    // loadProfiles();
  }, [filters]);

  return (
    <main>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="mb-2">Dashboard</h1>
          <p className="text-zinc-600">
            Welcome back! Here's what's happening with your app today.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="bg-white p-6 rounded-lg shadow-sm border border-zinc-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${metric.color} text-white p-3 rounded-lg`}>
                  {metric.icon}
                </div>
                <span className="text-sm text-green-600">{metric.change}</span>
              </div>
              <p className="text-zinc-600 text-sm mb-1">{metric.label}</p>
              <p className="font-semibold">{metric.value}</p>
            </div>
          ))}
        </div>

        <div className="mb-8">
          <h1 className="mb-2">Profiles</h1>
          <p className="text-zinc-600">Manage and view all user profiles</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-zinc-200">
          <div className="p-6 border-b border-zinc-200">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search profiles..."
                  // value={searchQuery}
                  // onChange={(e) => {
                  //   setSearchQuery(e.target.value);
                  //   setCurrentPage(1);
                  // }}
                  className="w-full pl-10 pr-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3">

                <select
                  onChange={(e) =>
                    setFilters((prev: any) => ({
                      ...prev,
                      gender: e.target.value,
                      page: 1,
                    }))
                  }
                >
                  <option value="">All</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm text-zinc-600">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm text-zinc-600">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-sm text-zinc-600">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-sm text-zinc-600">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm text-zinc-600">
                    Join Date
                  </th>
                  <th className="px-6 py-3 text-left text-sm text-zinc-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {[].map((profile: any) => (
                  // {paginatedProfiles.map((profile) => (
                  <tr
                    key={profile.id}
                    className="hover:bg-zinc-50 transition-colors"
                  >
                    <td className="px-6 py-4">{profile.name}</td>
                    <td className="px-6 py-4 text-zinc-600">{profile.email}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        {profile.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          profile.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-zinc-100 text-zinc-700"
                        }`}
                      >
                        {profile.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-600">
                      {profile.joinDate}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/profiles/${profile.id}`}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* <div className="p-6 border-t border-zinc-200 flex items-center justify-between">
              <p className="text-sm text-zinc-600">
                Showing {startIndex + 1} to{" "}
                {Math.min(startIndex + itemsPerPage, filteredProfiles.length)}{" "}
                of {filteredProfiles.length} profiles
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-zinc-300 rounded-lg hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <ChevronLeft size={20} />
                  Previous
                </button>
                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-zinc-300 rounded-lg hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  Next
                  <ChevronRight size={20} />
                </button>
              </div>
            </div> */}
        </div>
      </div>
    </main>
  );
};

export default Dashboard;

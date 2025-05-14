import StatsCard from "../components/StatsCard";
import ChartCard from "../components/ChartCard";
import ActivityCard from "../components/ActivityCard";

export default function Dashboard() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
          Dashboard
        </h1>
        <button className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-md flex items-center">
          <i className="fa-solid fa-plus mr-1.5"></i>
          Add Project
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Revenue"
          icon={<i className="fa-solid fa-dollar-sign"></i>}
          value="$24,780"
          change="12%"
          trend="up"
          color="blue"
        />
        <StatsCard
          title="New Users"
          icon={<i className="fa-solid fa-users"></i>}
          value="573"
          change="8%"
          trend="up"
          color="green"
        />
        <StatsCard
          title="Active Projects"
          icon={<i className="fa-solid fa-folder"></i>}
          value="12"
          change="2"
          trend="down"
          color="purple"
        />
        <StatsCard
          title="Conversion Rate"
          icon={<i className="fa-solid fa-chart-pie"></i>}
          value="6.28%"
          change="1.2%"
          trend="up"
          color="indigo"
        />
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <ChartCard
            title="Revenue Overview"
            subtitle="Showing daily revenue from all sources"
          />
        </div>
        <div>
          <ActivityCard />
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-base font-medium text-gray-800 dark:text-white">
            Recent Projects
          </h3>
          <div className="flex items-center space-x-1.5">
            <button className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">
              <i className="fa-solid fa-filter text-xs"></i>
            </button>
            <button className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">
              <i className="fa-solid fa-ellipsis-vertical text-xs"></i>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-800">
                <th className="px-3 py-2">Project</th>
                <th className="px-3 py-2">Progress</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Deadline</th>
                <th className="px-3 py-2">Assigned to</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              <tr className="text-xs text-gray-800 dark:text-gray-300">
                <td className="px-3 py-2">Website Redesign</td>
                <td className="px-3 py-2">
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                      <div
                        className="bg-blue-500 h-1.5 rounded-full"
                        style={{ width: "75%" }}
                      ></div>
                    </div>
                    <span className="ml-1.5 text-xs font-medium">75%</span>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <span className="px-1.5 py-0.5 text-xs font-medium bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                    Active
                  </span>
                </td>
                <td className="px-3 py-2">May 25, 2025</td>
                <td className="px-3 py-2">
                  <div className="flex -space-x-1.5">
                    <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium">
                      JD
                    </div>
                    <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-medium">
                      AS
                    </div>
                  </div>
                </td>
              </tr>
              <tr className="text-xs text-gray-800 dark:text-gray-300">
                <td className="px-3 py-2">Mobile App Development</td>
                <td className="px-3 py-2">
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                      <div
                        className="bg-blue-500 h-1.5 rounded-full"
                        style={{ width: "45%" }}
                      ></div>
                    </div>
                    <span className="ml-1.5 text-xs font-medium">45%</span>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <span className="px-1.5 py-0.5 text-xs font-medium bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full">
                    In Progress
                  </span>
                </td>
                <td className="px-4 py-3">June 15, 2025</td>
                <td className="px-4 py-3">
                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-medium">
                      RJ
                    </div>
                    <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-medium">
                      ML
                    </div>
                    <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-medium">
                      TD
                    </div>
                  </div>
                </td>
              </tr>
              <tr className="text-sm text-gray-800 dark:text-gray-300">
                <td className="px-4 py-3">Marketing Campaign</td>
                <td className="px-4 py-3">
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: "90%" }}
                      ></div>
                    </div>
                    <span className="ml-2 text-xs font-medium">90%</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 text-xs font-medium bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                    Active
                  </span>
                </td>
                <td className="px-4 py-3">May 20, 2025</td>
                <td className="px-4 py-3">
                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium">
                      JD
                    </div>
                  </div>
                </td>
              </tr>
              <tr className="text-sm text-gray-800 dark:text-gray-300">
                <td className="px-4 py-3">Database Migration</td>
                <td className="px-4 py-3">
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: "30%" }}
                      ></div>
                    </div>
                    <span className="ml-2 text-xs font-medium">30%</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 text-xs font-medium bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full">
                    In Progress
                  </span>
                </td>
                <td className="px-4 py-3">July 5, 2025</td>
                <td className="px-4 py-3">
                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-medium">
                      AS
                    </div>
                    <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-medium">
                      TD
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../lib/useAuth";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import SymptomModal from "./components/SymptomModal";
import IllnessModal from "./components/IllnessModal";
import ExpertSystemModal from "./components/ExpertSystemModal";
import UserModal, { type AdminUser } from "./components/UserModal";

const roleBadgeClass: Record<AdminUser["role"], string> = {
  admin: "bg-blue-100 text-blue-800",
  expert: "bg-amber-100 text-amber-800",
  user: "bg-zinc-100 text-zinc-700",
};

const roleLabel: Record<AdminUser["role"], string> = {
  admin: "Admin",
  expert: "Expert",
  user: "User",
};

interface Symptom {
  no: number;
  kodeGejala: string;
  namaGejala: string;
  symptomsName: string;
}

interface Illness {
  no: number;
  kodePenyakit: string;
  namaPenyakit: string;
}

interface ExpertSystemEntry {
  no: number;
  kodeGejala: string;
  cf: {
    P1: number | null;
    P2: number | null;
    P3: number | null;
    P4: number | null;
    P5: number | null;
    P6: number | null;
  };
}

type TabType = "symptoms" | "illnesses" | "expert-system" | "users";

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("symptoms");
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [illnesses, setIllnesses] = useState<Illness[]>([]);
  const [expertSystem, setExpertSystem] = useState<ExpertSystemEntry[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [symptomModalOpen, setSymptomModalOpen] = useState(false);
  const [illnessModalOpen, setIllnessModalOpen] = useState(false);
  const [expertSystemModalOpen, setExpertSystemModalOpen] = useState(false);
  
  const [editingSymptom, setEditingSymptom] = useState<Symptom | undefined>(undefined);
  const [editingIllness, setEditingIllness] = useState<Illness | undefined>(undefined);
  const [editingExpertSystem, setEditingExpertSystem] = useState<ExpertSystemEntry | undefined>(undefined);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | undefined>(undefined);

  useEffect(() => {
    if (!loading && (!user || (user.role !== "admin" && user.role !== "expert"))) {
      router.push("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && (user.role === "admin" || user.role === "expert")) {
      loadData();
    }
  }, [user, activeTab]);

  const loadData = async () => {
    setDataLoading(true);
    const token = localStorage.getItem('auth_token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      if (activeTab === "symptoms") {
        const res = await fetch("/api/admin/symptoms", { headers });
        const data = await res.json();
        setSymptoms(data.symptoms || []);
      } else if (activeTab === "illnesses") {
        const res = await fetch("/api/admin/illnesses", { headers });
        const data = await res.json();
        setIllnesses(data.illnesses || []);
      } else if (activeTab === "expert-system") {
        const res = await fetch("/api/admin/expert-system", { headers });
        const data = await res.json();
        setExpertSystem(data.expertSystem || []);
      } else if (activeTab === "users") {
        const res = await fetch("/api/admin/users", { headers });
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    }
    setDataLoading(false);
  };

  const handleAddNew = () => {
    if (activeTab === "symptoms") {
      setEditingSymptom(undefined);
      setSymptomModalOpen(true);
    } else if (activeTab === "illnesses") {
      setEditingIllness(undefined);
      setIllnessModalOpen(true);
    } else if (activeTab === "expert-system") {
      setEditingExpertSystem(undefined);
      setExpertSystemModalOpen(true);
    } else if (activeTab === "users") {
      setEditingUser(undefined);
      setUserModalOpen(true);
    }
  };

  const handleEdit = (item: any) => {
    if (activeTab === "symptoms") {
      setEditingSymptom(item);
      setSymptomModalOpen(true);
    } else if (activeTab === "illnesses") {
      setEditingIllness(item);
      setIllnessModalOpen(true);
    } else if (activeTab === "expert-system") {
      setEditingExpertSystem(item);
      setExpertSystemModalOpen(true);
    } else if (activeTab === "users") {
      setEditingUser(item);
      setUserModalOpen(true);
    }
  };

  const handleModalSave = () => {
    loadData();
  };

  const handleDelete = async (no: number) => {
    if (!confirm("Are you sure you want to delete this entry?")) {
      return;
    }

    const token = localStorage.getItem('auth_token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      let endpoint = "";
      if (activeTab === "symptoms") {
        endpoint = `/api/admin/symptoms/${no}`;
      } else if (activeTab === "illnesses") {
        endpoint = `/api/admin/illnesses/${no}`;
      } else if (activeTab === "expert-system") {
        endpoint = `/api/admin/expert-system/${no}`;
      }

      const res = await fetch(endpoint, {
        method: "DELETE",
        headers,
      });

      if (res.ok) {
        loadData();
      } else {
        alert("Failed to delete entry");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete entry");
    }
  };

  if (loading || !user) {
    return (
      <div className="flex min-h-screen flex-col bg-zinc-50">
        <Header locale="en" />
        <main className="flex flex-1 items-center justify-center">
          <p className="text-lg text-zinc-600">Loading...</p>
        </main>
      </div>
    );
  }

  const filteredSymptoms = symptoms.filter(
    (s) =>
      s.kodeGejala.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.namaGejala.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.symptomsName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredIllnesses = illnesses.filter(
    (i) =>
      i.kodePenyakit.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.namaPenyakit.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredExpertSystem = expertSystem.filter((e) =>
    e.kodeGejala.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <Header locale="en" />
      <main className="flex-1 px-6 py-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-4xl font-bold text-zinc-900 mb-8">Admin Panel - Master Data</h1>

          {/* Tab Navigation */}
          <div className="border-b border-zinc-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("symptoms")}
                className={`${
                  activeTab === "symptoms"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-zinc-600 hover:text-zinc-900 hover:border-zinc-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Symptoms ({symptoms.length})
              </button>
              <button
                onClick={() => setActiveTab("illnesses")}
                className={`${
                  activeTab === "illnesses"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-zinc-600 hover:text-zinc-900 hover:border-zinc-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Illnesses ({illnesses.length})
              </button>
              <button
                onClick={() => setActiveTab("expert-system")}
                className={`${
                  activeTab === "expert-system"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-zinc-600 hover:text-zinc-900 hover:border-zinc-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Expert System ({expertSystem.length})
              </button>
              {user.role === "admin" && (
                <button
                  onClick={() => setActiveTab("users")}
                  className={`${
                    activeTab === "users"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-zinc-600 hover:text-zinc-900 hover:border-zinc-300"
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Users ({users.length})
                </button>
              )}
            </nav>
          </div>

          {/* Search Bar */}
          <div className="mb-6 flex justify-between items-center">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
            <button 
              onClick={handleAddNew}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              + Add New
            </button>
          </div>

          {/* Data Table */}
          {dataLoading ? (
            <div className="text-center py-12">
              <p className="text-zinc-600">Loading data...</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {activeTab === "symptoms" && (
                <table className="min-w-full divide-y divide-zinc-200">
                  <thead className="bg-zinc-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                        No
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                        Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                        Indonesian Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                        English Name
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-zinc-200">
                    {filteredSymptoms.map((symptom) => (
                      <tr key={symptom.no}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900">
                          {symptom.no}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900">
                          {symptom.kodeGejala}
                        </td>
                        <td className="px-6 py-4 text-sm text-zinc-900">
                          {symptom.namaGejala}
                        </td>
                        <td className="px-6 py-4 text-sm text-zinc-600">
                          {symptom.symptomsName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button 
                            onClick={() => handleEdit(symptom)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(symptom.no)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeTab === "illnesses" && (
                <table className="min-w-full divide-y divide-zinc-200">
                  <thead className="bg-zinc-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                        No
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                        Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-zinc-200">
                    {filteredIllnesses.map((illness) => (
                      <tr key={illness.no}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900">
                          {illness.no}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900">
                          {illness.kodePenyakit}
                        </td>
                        <td className="px-6 py-4 text-sm text-zinc-900">
                          {illness.namaPenyakit}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button 
                            onClick={() => handleEdit(illness)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(illness.no)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeTab === "expert-system" && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-zinc-200">
                    <thead className="bg-zinc-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                          No
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                          Symptom Code
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider">
                          P1
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider">
                          P2
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider">
                          P3
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider">
                          P4
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider">
                          P5
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider">
                          P6
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-zinc-200">
                      {filteredExpertSystem.map((entry) => (
                        <tr key={entry.no}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900">
                            {entry.no}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900">
                            {entry.kodeGejala}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-zinc-900">
                            {entry.cf.P1 !== null ? entry.cf.P1 : "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-zinc-900">
                            {entry.cf.P2 !== null ? entry.cf.P2 : "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-zinc-900">
                            {entry.cf.P3 !== null ? entry.cf.P3 : "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-zinc-900">
                            {entry.cf.P4 !== null ? entry.cf.P4 : "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-zinc-900">
                            {entry.cf.P5 !== null ? entry.cf.P5 : "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-zinc-900">
                            {entry.cf.P6 !== null ? entry.cf.P6 : "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button 
                              onClick={() => handleEdit(entry)}
                              className="text-blue-600 hover:text-blue-900 mr-4"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(entry.no)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === "users" && (
                <table className="min-w-full divide-y divide-zinc-200">
                  <thead className="bg-zinc-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                        Username
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                        Full Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                        Age
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                        Gender
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-zinc-200">
                    {filteredUsers.map((u) => (
                      <tr key={u.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900">
                          {u.username}
                          {u.id === user.id && (
                            <span className="ml-2 text-xs font-normal text-zinc-500">(you)</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-zinc-900">{u.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600">
                          {u.age ?? "—"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600">
                          {u.gender ?? "—"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${roleBadgeClass[u.role]}`}
                          >
                            {roleLabel[u.role]}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {u.id === user.id ? (
                            <span className="text-zinc-400">—</span>
                          ) : (
                            <button
                              onClick={() => handleEdit(u)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Edit
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Empty State */}
          {!dataLoading && activeTab === "symptoms" && filteredSymptoms.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-zinc-600">No symptoms found</p>
            </div>
          )}
          {!dataLoading && activeTab === "illnesses" && filteredIllnesses.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-zinc-600">No illnesses found</p>
            </div>
          )}
          {!dataLoading && activeTab === "expert-system" && filteredExpertSystem.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-zinc-600">No expert system entries found</p>
            </div>
          )}
          {!dataLoading && activeTab === "users" && filteredUsers.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-zinc-600">No users found</p>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <SymptomModal
        isOpen={symptomModalOpen}
        onClose={() => setSymptomModalOpen(false)}
        onSave={handleModalSave}
        symptom={editingSymptom}
      />
      
      <IllnessModal
        isOpen={illnessModalOpen}
        onClose={() => setIllnessModalOpen(false)}
        onSave={handleModalSave}
        illness={editingIllness}
      />
      
      <ExpertSystemModal
        isOpen={expertSystemModalOpen}
        onClose={() => setExpertSystemModalOpen(false)}
        onSave={handleModalSave}
        entry={editingExpertSystem}
        symptoms={symptoms}
        illnesses={illnesses}
      />

      <UserModal
        isOpen={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        onSave={handleModalSave}
        user={editingUser}
        currentUserId={user.id}
      />
    </div>
  );
}

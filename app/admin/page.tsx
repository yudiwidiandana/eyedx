"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../lib/useAuth";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import Header from "../components/Header";
import { type Locale } from "../lib/translations";
import SymptomModal from "./components/SymptomModal";
import IllnessModal from "./components/IllnessModal";
import ExpertSystemModal from "./components/ExpertSystemModal";
import UserModal, { type AdminUser } from "./components/UserModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

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

export function AdminPageContent({ locale }: { locale: Locale }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const path = (segment: string) =>
    `/${locale === "en" ? segment : [locale, segment].filter(Boolean).join("/")}`;
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
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!loading && (!user || (user.role !== "admin" && user.role !== "expert"))) {
      router.push(path(""));
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role === "expert") {
      setActiveTab("expert-system");
    }
  }, [user]);

  useEffect(() => {
    if (user && (user.role === "admin" || user.role === "expert")) {
      loadData();
    }
  }, [user, activeTab]);

  const loadData = async () => {
    setDataLoading(true);

    try {
      if (activeTab === "symptoms") {
        const res = await fetch("/api/admin/symptoms");
        const data = await res.json();
        setSymptoms(data.symptoms || []);
      } else if (activeTab === "illnesses") {
        const res = await fetch("/api/admin/illnesses");
        const data = await res.json();
        setIllnesses(data.illnesses || []);
      } else if (activeTab === "expert-system") {
        const res = await fetch("/api/admin/expert-system");
        const data = await res.json();
        setExpertSystem(data.expertSystem || []);
      } else if (activeTab === "users") {
        const res = await fetch("/api/admin/users");
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

  const handleDelete = (no: number) => {
    setDeleteTarget(no);
  };

  const confirmDelete = async () => {
    if (deleteTarget === null) return;
    const no = deleteTarget;
    setDeleting(true);

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
      });

      if (res.ok) {
        loadData();
      } else {
        const data = await res.json().catch(() => null);
        alert(data?.error || "Failed to delete entry");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete entry");
    }
    setDeleting(false);
    setDeleteTarget(null);
  };

  if (loading || !user) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header locale={locale} />
        <main className="flex flex-1 items-center justify-center">
          <p className="text-lg text-muted-foreground">Loading...</p>
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
    <div className="flex min-h-screen flex-col bg-background">
      <Header locale={locale} />
      <main className="flex-1 px-6 py-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <h1 className="mb-8 text-4xl font-bold text-foreground">Admin Panel - Master Data</h1>

          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as TabType)}
            className="gap-0"
          >
            <TabsList variant="line" className="mb-6 h-auto w-full justify-start gap-6 border-b border-border bg-transparent p-0">
              {user.role === "admin" && (
                <>
                  <TabsTrigger value="symptoms" className="h-auto rounded-none px-1 py-3 text-sm font-medium">
                    Symptoms ({symptoms.length})
                  </TabsTrigger>
                  <TabsTrigger value="illnesses" className="h-auto rounded-none px-1 py-3 text-sm font-medium">
                    Illnesses ({illnesses.length})
                  </TabsTrigger>
                </>
              )}
              <TabsTrigger value="expert-system" className="h-auto rounded-none px-1 py-3 text-sm font-medium">
                Expert System ({expertSystem.length})
              </TabsTrigger>
              {user.role === "admin" && (
                <TabsTrigger value="users" className="h-auto rounded-none px-1 py-3 text-sm font-medium">
                  Users ({users.length})
                </TabsTrigger>
              )}
            </TabsList>

            {/* Search Bar */}
            <div className="mb-6 flex items-center justify-between gap-4">
              <Input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-11 w-64"
              />
              <Button onClick={handleAddNew} className="h-11">
                + Add New
              </Button>
            </div>

            {/* Data Table */}
            {dataLoading ? (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">Loading data...</p>
              </div>
            ) : (
              <Card className="overflow-hidden py-0">
                <TabsContent value="symptoms">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>No</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Indonesian Name</TableHead>
                        <TableHead>English Name</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSymptoms.map((symptom) => (
                        <TableRow key={symptom.no}>
                          <TableCell>{symptom.no}</TableCell>
                          <TableCell className="font-medium">{symptom.kodeGejala}</TableCell>
                          <TableCell className="whitespace-normal">{symptom.namaGejala}</TableCell>
                          <TableCell className="whitespace-normal text-muted-foreground">
                            {symptom.symptomsName}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label="Edit"
                                onClick={() => handleEdit(symptom)}
                              >
                                <Pencil />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label="Delete"
                                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => handleDelete(symptom.no)}
                              >
                                <Trash2 />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>

                <TabsContent value="illnesses">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>No</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredIllnesses.map((illness) => (
                        <TableRow key={illness.no}>
                          <TableCell>{illness.no}</TableCell>
                          <TableCell className="font-medium">{illness.kodePenyakit}</TableCell>
                          <TableCell className="whitespace-normal">{illness.namaPenyakit}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label="Edit"
                                onClick={() => handleEdit(illness)}
                              >
                                <Pencil />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label="Delete"
                                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => handleDelete(illness.no)}
                              >
                                <Trash2 />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>

                <TabsContent value="expert-system">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>No</TableHead>
                        <TableHead>Symptom Code</TableHead>
                        <TableHead className="text-center">P1</TableHead>
                        <TableHead className="text-center">P2</TableHead>
                        <TableHead className="text-center">P3</TableHead>
                        <TableHead className="text-center">P4</TableHead>
                        <TableHead className="text-center">P5</TableHead>
                        <TableHead className="text-center">P6</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredExpertSystem.map((entry) => (
                        <TableRow key={entry.no}>
                          <TableCell>{entry.no}</TableCell>
                          <TableCell className="font-medium">{entry.kodeGejala}</TableCell>
                          <TableCell className="text-center">
                            {entry.cf.P1 !== null ? entry.cf.P1 : "-"}
                          </TableCell>
                          <TableCell className="text-center">
                            {entry.cf.P2 !== null ? entry.cf.P2 : "-"}
                          </TableCell>
                          <TableCell className="text-center">
                            {entry.cf.P3 !== null ? entry.cf.P3 : "-"}
                          </TableCell>
                          <TableCell className="text-center">
                            {entry.cf.P4 !== null ? entry.cf.P4 : "-"}
                          </TableCell>
                          <TableCell className="text-center">
                            {entry.cf.P5 !== null ? entry.cf.P5 : "-"}
                          </TableCell>
                          <TableCell className="text-center">
                            {entry.cf.P6 !== null ? entry.cf.P6 : "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label="Edit"
                                onClick={() => handleEdit(entry)}
                              >
                                <Pencil />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label="Delete"
                                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => handleDelete(entry.no)}
                              >
                                <Trash2 />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>

                <TabsContent value="users">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Username</TableHead>
                        <TableHead>Full Name</TableHead>
                        <TableHead>Age</TableHead>
                        <TableHead>Gender</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell className="font-medium">
                            {u.username}
                            {u.id === user.id && (
                              <span className="ml-2 text-xs font-normal text-muted-foreground">(you)</span>
                            )}
                          </TableCell>
                          <TableCell className="whitespace-normal">{u.name}</TableCell>
                          <TableCell className="text-muted-foreground">{u.age ?? "—"}</TableCell>
                          <TableCell className="text-muted-foreground">{u.gender ?? "—"}</TableCell>
                          <TableCell>
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${roleBadgeClass[u.role]}`}
                            >
                              {roleLabel[u.role]}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            {u.id === user.id ? (
                              <span className="text-muted-foreground/60">—</span>
                            ) : (
                              <div className="flex justify-end">
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  aria-label="Edit"
                                  onClick={() => handleEdit(u)}
                                >
                                  <Pencil />
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
              </Card>
            )}
          </Tabs>

          {/* Empty State */}
          {!dataLoading && activeTab === "symptoms" && filteredSymptoms.length === 0 && (
            <div className="rounded-lg bg-card py-12 text-center">
              <p className="text-muted-foreground">No symptoms found</p>
            </div>
          )}
          {!dataLoading && activeTab === "illnesses" && filteredIllnesses.length === 0 && (
            <div className="rounded-lg bg-card py-12 text-center">
              <p className="text-muted-foreground">No illnesses found</p>
            </div>
          )}
          {!dataLoading && activeTab === "expert-system" && filteredExpertSystem.length === 0 && (
            <div className="rounded-lg bg-card py-12 text-center">
              <p className="text-muted-foreground">No expert system entries found</p>
            </div>
          )}
          {!dataLoading && activeTab === "users" && filteredUsers.length === 0 && (
            <div className="rounded-lg bg-card py-12 text-center">
              <p className="text-muted-foreground">No users found</p>
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

      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the entry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function AdminPage() {
  return <AdminPageContent locale="en" />;
}

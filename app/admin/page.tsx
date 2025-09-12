import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export default async function AdminPage() {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (role !== "ADMIN") {
    return <div className="max-w-md mx-auto card p-6">Pristup dozvoljen samo administratoru.</div>;
  }
  
  const users = await prisma.user.findMany({ 
    orderBy: { createdAt: "desc" }, 
    include: { membership: true, checkins: { orderBy: { createdAt: "desc" }, take: 5 } } 
  });

  const activeUsers = users.filter(u => u.membership?.active && (!u.membership?.expiresAt || u.membership.expiresAt > new Date()));
  const expiredUsers = users.filter(u => u.membership?.expiresAt && u.membership.expiresAt <= new Date() && u.membership.active);
  
  async function updateMembership(formData: FormData) {
    "use server";
    const userId = formData.get("userId") as string;
    const action = formData.get("action") as string;
    
    if (action === "activate") {
      const plan = formData.get("plan") as string;
      const amount = parseFloat(formData.get("amount") as string);
      const months = parseInt(formData.get("months") as string);
      
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + months);
      
      await prisma.membership.upsert({
        where: { userId },
        create: { 
          userId, 
          active: true, 
          expiresAt, 
          plan,
          paidAt: new Date(),
          paidAmount: amount
        },
        update: { 
          active: true, 
          expiresAt, 
          plan,
          paidAt: new Date(),
          paidAmount: amount
        }
      });
    } else if (action === "deactivate") {
      await prisma.membership.update({
        where: { userId },
        data: { active: false }
      });
    } else if (action === "extend") {
      const months = parseInt(formData.get("months") as string);
      const amount = parseFloat(formData.get("amount") as string);
      const membership = await prisma.membership.findUnique({ where: { userId } });
      
      if (membership) {
        const currentExpiry = membership.expiresAt && membership.expiresAt > new Date() 
          ? membership.expiresAt 
          : new Date();
        const newExpiry = new Date(currentExpiry);
        newExpiry.setMonth(newExpiry.getMonth() + months);
        
        await prisma.membership.update({
          where: { userId },
          data: { 
            expiresAt: newExpiry,
            active: true,
            paidAt: new Date(),
            paidAmount: amount
          }
        });
      }
    }
    
    revalidatePath("/admin");
  }

  async function deleteUser(formData: FormData) {
    "use server";
    const userId = formData.get("userId") as string;
    await prisma.user.delete({ where: { id: userId } });
    revalidatePath("/admin");
  }

  async function expireInactive() {
    "use server";
    const expired = await prisma.membership.updateMany({
      where: {
        active: true,
        expiresAt: { lte: new Date() }
      },
      data: { active: false }
    });
    revalidatePath("/admin");
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Admin Panel</h2>
        <form action={expireInactive}>
          <button className="btn btn-secondary">Deaktiviraj istekle članarine</button>
        </form>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="card p-4">
          <h3 className="text-lg font-semibold mb-2">Statistika</h3>
          <p>Ukupno korisnika: {users.length}</p>
          <p className="text-green-600">Aktivnih članova: {activeUsers.length}</p>
          <p className="text-red-600">Isteklih članarina: {expiredUsers.length}</p>
        </div>
        
        <div className="card p-4">
          <h3 className="text-lg font-semibold mb-2">Cenovnik</h3>
          <p>Mesečna članarina: 3000 RSD</p>
          <p>3 meseca: 8000 RSD</p>
          <p>6 meseci: 15000 RSD</p>
          <p>Godišnja: 28000 RSD</p>
        </div>

        <div className="card p-4">
          <h3 className="text-lg font-semibold mb-2">Današnji dolasci</h3>
          <p className="text-2xl font-bold">
            {users.reduce((acc, u) => {
              const today = new Date().toDateString();
              return acc + u.checkins.filter(c => c.createdAt.toDateString() === today).length;
            }, 0)}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Korisnici</h3>
        
        {expiredUsers.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-800 font-semibold">⚠️ Istekle članarine ({expiredUsers.length})</p>
            <p className="text-sm text-red-600">Klikni "Deaktiviraj istekle članarine" da bi automatski deaktivirao sve istekle</p>
          </div>
        )}

        <div className="grid gap-4">
          {users.map(u => {
            const active = u.membership?.active && (!u.membership?.expiresAt || u.membership.expiresAt > new Date());
            const expired = u.membership?.expiresAt && u.membership.expiresAt <= new Date();
            const daysLeft = u.membership?.expiresAt 
              ? Math.ceil((u.membership.expiresAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
              : null;
            
            return (
              <div key={u.id} className={`card p-4 ${expired ? 'border-red-500 bg-red-50' : ''}`}>
                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <div className="font-semibold text-lg">{u.name || u.email}</div>
                    <div className="text-xs text-gray-500">ID: {u.id.slice(0, 8)}...</div>
                    <div className="text-sm mt-1">
                      {active ? (
                        <span className="text-green-600 font-semibold">✓ Aktivna članarina</span>
                      ) : expired ? (
                        <span className="text-red-600 font-semibold">✗ Istekla članarina</span>
                      ) : (
                        <span className="text-gray-500">Neaktivna</span>
                      )}
                    </div>
                    {u.membership?.plan && (
                      <div className="text-sm text-gray-600">Plan: {u.membership.plan}</div>
                    )}
                  </div>
                  
                  <div>
                    <div className="text-sm font-semibold mb-1">Članarina</div>
                    {u.membership?.expiresAt && (
                      <>
                        <div className="text-sm">
                          Važi do: {new Date(u.membership.expiresAt).toLocaleDateString('sr-RS')}
                        </div>
                        {daysLeft !== null && daysLeft > 0 && (
                          <div className={`text-sm ${daysLeft <= 7 ? 'text-orange-600 font-semibold' : 'text-gray-600'}`}>
                            Preostalo: {daysLeft} dana
                          </div>
                        )}
                      </>
                    )}
                    {u.membership?.paidAt && (
                      <div className="text-xs text-gray-500">
                        Plaćeno: {new Date(u.membership.paidAt).toLocaleDateString('sr-RS')}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <div className="text-sm font-semibold mb-1">Dolasci</div>
                    <div className="text-sm">Ukupno: {u.checkins.length}</div>
                    {u.checkins.length > 0 && (
                      <div className="text-xs text-gray-500">
                        Poslednji: {new Date(u.checkins[0].createdAt).toLocaleDateString('sr-RS')}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 items-start">
                    {!active && (
                      <form action={updateMembership} className="flex gap-1">
                        <input type="hidden" name="userId" value={u.id} />
                        <input type="hidden" name="action" value="activate" />
                        <select name="months" className="input input-sm" required>
                          <option value="">Meseci</option>
                          <option value="1">1 mesec</option>
                          <option value="3">3 meseca</option>
                          <option value="6">6 meseci</option>
                          <option value="12">12 meseci</option>
                        </select>
                        <input type="number" name="amount" placeholder="Iznos" className="input input-sm w-24" required />
                        <select name="plan" className="input input-sm" required>
                          <option value="">Plan</option>
                          <option value="Basic">Basic</option>
                          <option value="Premium">Premium</option>
                          <option value="VIP">VIP</option>
                        </select>
                        <button className="btn btn-sm btn-primary">Aktiviraj</button>
                      </form>
                    )}
                    
                    {active && (
                      <>
                        <form action={updateMembership} className="flex gap-1">
                          <input type="hidden" name="userId" value={u.id} />
                          <input type="hidden" name="action" value="extend" />
                          <select name="months" className="input input-sm" required>
                            <option value="">Produži</option>
                            <option value="1">+1 mesec</option>
                            <option value="3">+3 meseca</option>
                            <option value="6">+6 meseci</option>
                            <option value="12">+12 meseci</option>
                          </select>
                          <input type="number" name="amount" placeholder="Iznos" className="input input-sm w-20" required />
                          <button className="btn btn-sm btn-secondary">Produži</button>
                        </form>
                        
                        <form action={updateMembership}>
                          <input type="hidden" name="userId" value={u.id} />
                          <input type="hidden" name="action" value="deactivate" />
                          <button className="btn btn-sm btn-error">Deaktiviraj</button>
                        </form>
                      </>
                    )}
                    
                    <form action={deleteUser} onSubmit={(e) => {
                      if (!confirm('Da li ste sigurni da želite da obrišete ovog korisnika?')) {
                        e.preventDefault();
                      }
                    }}>
                      <input type="hidden" name="userId" value={u.id} />
                      <button className="btn btn-sm btn-error">🗑️</button>
                    </form>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
// import { useEffect, useState } from 'react';
// import Card from '../components/Card';
// import { Building2, Target, Eye, Phone, Mail, Users, ShieldCheck, Workflow, Loader2 } from 'lucide-react';
// import { fetchPublicCorporateMembers } from '../services/corporateService';
// import type { CorporateMemberDto } from '../types';
// import { resolveMediaUrl } from '../utils/media';

// const focusAreas = [
//   {
//     title: 'People & Leadership',
//     description: 'Champion a culture of safety, inclusivity, and continuous learning across all divisions.',
//     icon: Users,
//   },
//   {
//     title: 'Operational Integrity',
//     description: 'Ensure compliance, governance, and asset resilience for reliable nationwide supply.',
//     icon: ShieldCheck,
//   },
//   {
//     title: 'Innovation & Transformation',
//     description: 'Accelerate smart grid adoption and digital services for customers and field teams.',
//     icon: Workflow,
//   },
// ];

// const statements = {
//   vision: 'Your vision statement goes here.',
//   mission:
//     'Deliver innovative energy solutions by empowering our people, advancing technology, and partnering with communities.',
// };

// export default function CorporateProfilePage() {
//   const [managementTeam, setManagementTeam] = useState<CorporateMemberDto[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const loadMembers = async () => {
//       try {
//         const members = await fetchPublicCorporateMembers();
//         setManagementTeam(members);
//       } catch (error) {
//         console.error('Failed to load corporate members:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadMembers();
//   }, []);

//   return (
//     <div className="min-h-screen bg-base">
//       <div className="relative h-[300px] bg-gradient-to-r from-primary to-secondary text-white overflow-hidden">
//         <div className="absolute inset-0 bg-[url('/images/corporate.jpg')] bg-cover bg-center opacity-30"></div>
//         <div className="absolute inset-0 bg-gradient-to-r from-primary/70 to-secondary/70"></div>
//         <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center items-start">
//           <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full border border-white/20 mb-6">
//             <Building2 className="h-4 w-4" />
//             <span className="text-xs font-semibold tracking-widest uppercase">Corporate Profile</span>
//           </div>
//           <h1 className="text-2xl md:text-3xl font-bold">Executive Leadership & Governance</h1>
//           <p className="text-white/80 max-w-2xl mt-3 text-base">
//             Overview of NSO strategic priorities, guiding principles, and senior contacts for each operational stream.
//           </p>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12 space-y-12">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <Card className="border-l-4 border-l-primary shadow-lg">
//             <div className="flex items-center gap-3 mb-4">
//               <Eye className="h-5 w-5 text-primary" />
//               <h2 className="text-base font-bold text-secondary">Vision</h2>
//             </div>
//             <p className="text-gray-600 leading-relaxed">{statements.vision}</p>
//           </Card>

//           <Card className="border-l-4 border-l-accent shadow-lg">
//             <div className="flex items-center gap-3 mb-4">
//               <Target className="h-5 w-5 text-accent" />
//               <h2 className="text-base font-bold text-secondary">Mission</h2>
//             </div>
//             <p className="text-gray-600 leading-relaxed">{statements.mission}</p>
//           </Card>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           {focusAreas.map((area) => {
//             const Icon = area.icon;
//             return (
//               <Card key={area.title} className="h-full" hover>
//                 <div className="flex items-center gap-3 mb-3">
//                   <div className="p-3 rounded-xl bg-primary/10 text-primary">
//                     <Icon className="h-5 w-5" />
//                   </div>
//                   <h3 className="text-base font-semibold text-secondary">{area.title}</h3>
//                 </div>
//                 <p className="text-sm text-gray-600 leading-relaxed">{area.description}</p>
//               </Card>
//             );
//           })}
//         </div>

//         <div>
//           <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
//             <div>
//               <p className="text-xs uppercase tracking-[0.3em] text-primary font-semibold">Leadership Directory</p>
//               <h2 className="text-xl font-bold text-secondary mt-2">Corporate Management Team</h2>
//             </div>
//           </div>

//           {loading ? (
//             <div className="flex justify-center items-center py-12">
//               <Loader2 className="h-8 w-8 animate-spin text-primary" />
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {managementTeam.map((manager) => (
//                 <Card key={manager.id || manager._id} hover className="border border-border/70 shadow-sm">
//                   {manager.imageUrl && (
//                     <div className="mb-4">
//                       <img
//                         src={resolveMediaUrl(manager.imageUrl)}
//                         alt={manager.name}
//                         className="w-full h-48 object-cover rounded-lg"
//                       />
//                     </div>
//                   )}
//                   <div className="mb-4">
//                     <p className="text-xs uppercase text-gray-500 tracking-widest">{manager.department}</p>
//                     <h3 className="text-base font-bold text-secondary mt-1">{manager.name}</h3>
//                     <p className="text-sm font-semibold text-primary">{manager.position}</p>
//                   </div>

//                   <div className="space-y-2 text-sm text-gray-600">
//                     <div className="flex items-center gap-2">
//                       <Phone className="h-4 w-4 text-accent" />
//                       <span>{manager.phone}</span>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <Mail className="h-4 w-4 text-accent" />
//                       <span>{manager.email}</span>
//                     </div>
//                   </div>
//                 </Card>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }






import { useEffect, useState, useMemo } from 'react';
import Card from '../components/Card';
import { Building2, Target, Eye, Phone, Mail, Users, ShieldCheck, Workflow, Loader2 } from 'lucide-react';
import { fetchPublicCorporateCategories, fetchPublicCorporateMembers } from '../services/corporateService';
import type { CorporateCategoryDto, CorporateMemberDto } from '../types';
import { resolveMediaUrl } from '../utils/media';

const focusAreas = [
  {
    title: 'People & Leadership',
    description: 'Champion a culture of safety, inclusivity, and continuous learning across all divisions.',
    icon: Users,
  },
  {
    title: 'Operational Integrity',
    description: 'Ensure compliance, governance, and asset resilience for reliable nationwide supply.',
    icon: ShieldCheck,
  },
  {
    title: 'Innovation & Transformation',
    description: 'Accelerate smart grid adoption and digital services for customers and field teams.',
    icon: Workflow,
  },
];

const statements = {
  vision: 'Your vision statement goes here.',
  mission:
    'Deliver innovative energy solutions by empowering our people, advancing technology, and partnering with communities.',
};

function DirectoryCard({ manager, index }: { manager: CorporateMemberDto; index: number }) {
  const initials = (manager.name || 'NA')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return (
    <article
      className="group w-64 overflow-hidden rounded-2xl border border-border/80 bg-white shadow-soft transition duration-300 hover:-translate-y-1 hover:border-primary/35 hover:shadow-vibrant"
      style={{ animation: `cardIn 0.45s ease-out ${index * 0.08}s both` }}
    >
      <div className="relative h-[320px] w-64 bg-gradient-to-b from-primary/15 via-primary/5 to-white">
        {manager.imageUrl ? (
          <img
            src={resolveMediaUrl(manager.imageUrl)}
            alt={manager.name}
            className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-primary/80 bg-primary/10 text-2xl font-bold text-primary">
              {initials || <Users className="h-10 w-10" />}
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-secondary/85 via-secondary/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 p-5 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/80">
            {manager.department || 'NSO (PVT) LTD.'}
          </p>
          <h3 className="mt-2 text-2xl font-bold leading-tight">{manager.name}</h3>
          <p className="mt-1 text-lg font-semibold text-white/90">{manager.position}</p>
        </div>
      </div>

      <div className="px-5 py-4 text-center">
        <a
          href={`mailto:${manager.email}`}
          className="block truncate text-[1.05rem] font-normal text-slate-500 transition-colors hover:text-primary"
        >
          {manager.email}
        </a>
        <a
          href={`tel:${manager.phone}`}
          className="mt-1 block text-[1.05rem] font-normal text-slate-500 transition-colors hover:text-primary"
        >
          {manager.phone}
        </a>
      </div>
    </article>
  );
}

export default function CorporateProfilePage() {
  const [managementTeam, setManagementTeam] = useState<CorporateMemberDto[]>([]);
  const [categories, setCategories] = useState<CorporateCategoryDto[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState('');
  const [loading, setLoading] = useState(true);

  const getCategoryId = (member: CorporateMemberDto) => {
    if (typeof member.category === 'string') return member.category;
    return member.category?._id || member.category?.id || '';
  };

  const orderedCategories = useMemo(
    () => [...categories].sort((a, b) => Number(a.displayOrder || 0) - Number(b.displayOrder || 0)),
    [categories]
  );

  const activeCategories = useMemo(
    () => orderedCategories.filter((category) => category.activeStatus !== false),
    [orderedCategories]
  );

  const membersByCategory = useMemo(() => {
    const map = new Map<string, CorporateMemberDto[]>();
    managementTeam.forEach((member) => {
      const categoryId = getCategoryId(member) || 'uncategorized';
      const list = map.get(categoryId) || [];
      list.push(member);
      map.set(categoryId, list);
    });
    return map;
  }, [managementTeam]);

  const hasUncategorized = membersByCategory.has('uncategorized');
  const categoryTabs = useMemo(() => {
    const tabs = activeCategories.map((category) => ({
      id: category.id || category._id || '',
      name: category.name,
    }));
    if (hasUncategorized) {
      tabs.push({ id: 'uncategorized', name: 'Uncategorized' });
    }
    return tabs.filter((tab) => tab.id);
  }, [activeCategories, hasUncategorized]);

  useEffect(() => {
    const loadMembers = async () => {
      try {
        const [categoryData, members] = await Promise.all([
          fetchPublicCorporateCategories(),
          fetchPublicCorporateMembers(),
        ]);
        setCategories(categoryData);
        setManagementTeam(members);
      } catch (error) {
        console.error('Failed to load corporate members:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMembers();
  }, []);

  useEffect(() => {
    if (!activeCategoryId && categoryTabs.length > 0) {
      setActiveCategoryId(categoryTabs[0].id);
    }
  }, [activeCategoryId, categoryTabs]);

  const displayedMembers = activeCategoryId
    ? (membersByCategory.get(activeCategoryId) || [])
    : managementTeam;
  const activeCategoryName = categoryTabs.find((tab) => tab.id === activeCategoryId)?.name;

  return (
    <div className="min-h-screen bg-base">
      <div className="relative h-[300px] bg-gradient-to-r from-primary to-secondary text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/corporate.jpg')] bg-cover bg-center opacity-30"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/70 to-secondary/70"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center items-start">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full border border-white/20 mb-6">
            <Building2 className="h-4 w-4" />
            <span className="text-xs font-semibold tracking-widest uppercase">Corporate Profile</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold">Executive Leadership & Governance</h1>
          <p className="text-white/80 max-w-2xl mt-3 text-base">
            Overview of NSO strategic priorities, guiding principles, and senior contacts for each operational stream.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-l-4 border-l-primary shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <Eye className="h-5 w-5 text-primary" />
              <h2 className="text-base font-bold text-secondary">Vision</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">{statements.vision}</p>
          </Card>

          <Card className="border-l-4 border-l-accent shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <Target className="h-5 w-5 text-accent" />
              <h2 className="text-base font-bold text-secondary">Mission</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">{statements.mission}</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {focusAreas.map((area) => {
            const Icon = area.icon;
            return (
              <Card key={area.title} className="h-full" hover>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-semibold text-secondary">{area.title}</h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{area.description}</p>
              </Card>
            );
          })}
        </div>

        <div className="rounded-3xl border border-border/70 bg-white/70 p-4 shadow-soft backdrop-blur-sm sm:p-6 lg:p-7">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-primary font-semibold">Leadership Directory</p>
              <h2 className="mt-2 text-2xl font-extrabold text-secondary md:text-3xl">Corporate Management Team</h2>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
              <div className="space-y-3 lg:sticky lg:top-24 lg:h-fit">
                {categoryTabs.length === 0 ? (
                  <div className="rounded-2xl border border-border bg-white px-5 py-6 text-sm text-gray-600">
                    Add categories to organize leadership teams.
                  </div>
                ) : (
                  categoryTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveCategoryId(tab.id)}
                      className={`w-full rounded-2xl border px-5 py-4 text-left text-[1.1rem] font-semibold transition-all ${
                        activeCategoryId === tab.id
                          ? 'border-primary bg-primary text-white shadow-vibrant'
                          : 'border-border bg-white text-secondary shadow-sm hover:border-primary/40 hover:bg-primary/[0.04]'
                      }`}
                    >
                      <span>{tab.name}</span>
                      <span
                        className={`ml-2 inline-flex min-w-6 items-center justify-center rounded-full px-1.5 py-0.5 text-xs ${
                          activeCategoryId === tab.id ? 'bg-white/20 text-white' : 'bg-muted text-slate-500'
                        }`}
                      >
                        {membersByCategory.get(tab.id)?.length || 0}
                      </span>
                    </button>
                  ))
                )}
              </div>

              <div>
                {activeCategoryName && <p className="mb-5 text-lg font-semibold text-primary">{activeCategoryName}</p>}
                {displayedMembers.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border bg-white px-6 py-10 text-center text-gray-500">
                    No members found for this category.
                  </div>
                ) : (
                  <div className="flex flex-wrap items-start gap-6">
                    {displayedMembers.map((manager, index) => (
                      <DirectoryCard key={manager.id || manager._id} manager={manager} index={index} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

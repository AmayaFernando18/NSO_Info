import Card from '../components/Card';
import { Building2, Target, Eye, Phone, Mail, Users, ShieldCheck, Workflow } from 'lucide-react';

const managementTeam = [
  {
    id: '1',
    name: 'Dr. B.L. Pradeep Priyadarshana Perera',
    role: 'Chairman',
    department: 'NSO (Pvt) Ltd.',
    phone: '+94 11 260 1001',
    email: 'chairman@nso.lk',
  },
  {
    id: '2',
    name: 'Eng. Mr. Susantha Fernando',
    role: 'CEO',
    department: 'NSO (Pvt) Ltd.',
    phone: '+94 11 260 1002',
    email: 'gm@nso.lk',
  },
  {
    id: '3',
    name: 'Mr. Udalamatta Gamage Deepthy Neranjith',
    role: 'Director',
    department: 'NSO (Pvt) Ltd.',
    phone: '+94 11 260 1010',
    email: 'dgm.operations@nso.lk',
  },
  {
    id: '4',
    name: 'Mrs. Tharshinie Prassanth',
    role: 'Director',
    department: 'NSO (Pvt) Ltd.',
    phone: '+94 11 260 1020',
    email: 'dgm.finance@nso.lk',
  },
  {
    id: '5',
    name: 'Eng. Janaka Aluthge',
    role: 'Director',
    department: 'NSO (Pvt) Ltd.',
    phone: '+94 11 260 1030',
    email: 'ce.planning@nso.lk',
  },
  {
    id: '6',
    name: 'Mr. Sanjaya Senanayake Mudalige',
    role: 'Director',
    department: 'NSO (Pvt) Ltd.',
    phone: '+94 11 260 1040',
    email: 'ce.customer@nso.lk',
  },
];

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

export default function CorporateProfilePage() {
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

        <div>
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-primary font-semibold">Leadership Directory</p>
              <h2 className="text-xl font-bold text-secondary mt-2">Corporate Management Team</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {managementTeam.map((manager) => (
              <Card key={manager.id} hover className="border border-border/70 shadow-sm">
                <div className="mb-4">
                  <p className="text-xs uppercase text-gray-500 tracking-widest">{manager.department}</p>
                  <h3 className="text-base font-bold text-secondary mt-1">{manager.name}</h3>
                  <p className="text-sm font-semibold text-primary">{manager.role}</p>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-accent" />
                    <span>{manager.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-accent" />
                    <span>{manager.email}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

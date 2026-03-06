import Breadcrumb from '../components/Breadcrumb';
import Card from '../components/Card';
import { Briefcase, MapPin, Clock, ArrowRight } from 'lucide-react';

interface JobListing {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
}

const jobs: JobListing[] = [
  {
    id: '1',
    title: 'DevOps Engineer',
    department: 'Engineering & Development',
    location: 'Colombo 02',
    type: 'Full-time',
    description: 'Lead infrastructure automation and deployment pipelines for critical power system operations.'
  },
  {
    id: '2',
    title: 'QA Automation Engineer',
    department: 'Quality Assurance (QA)',
    location: 'Colombo 02',
    type: 'Full-time',
    description: 'Develop and maintain automated testing frameworks for power system software applications.'
  },
  {
    id: '3',
    title: 'Customer Success Executive',
    department: 'Customer Support',
    location: 'Colombo 02',
    type: 'Full-time',
    description: 'Ensure excellent service delivery and maintain strong relationships with stakeholders.'
  },
  {
    id: '4',
    title: 'System Operations Engineer',
    department: 'Engineering & Development',
    location: 'Colombo 02',
    type: 'Full-time',
    description: 'Monitor and optimize real-time power system operations and dispatch activities.'
  },
  {
    id: '5',
    title: 'Data Analyst',
    department: 'Planning & Analysis',
    location: 'Colombo 02',
    type: 'Full-time',
    description: 'Analyze power demand patterns and forecast system requirements for efficient planning.'
  }
];

const departments = [
  { name: 'Engineering & Development', count: 2 },
  { name: 'Quality Assurance (QA)', count: 1 },
  { name: 'Customer Support', count: 1 },
  { name: 'Planning & Analysis', count: 1 }
];

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-base">
      {/* Hero Section */}
      <div className="relative h-[350px] bg-gradient-to-r from-secondary via-primary to-secondary overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/team.avif')] bg-cover bg-center opacity-50"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-secondary/60 to-primary/50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">Join Our Team</h1>
          <p className="text-base text-gray-100 max-w-2xl">
            Help shape the future of innovation while growing your career with us. Explore our current openings and find where you fit in
          </p>
          <Breadcrumb items={[{ label: 'Join Our Team' }]} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Departments */}
          <div className="lg:col-span-1">
            <Card>
              <h3 className="text-lg font-bold text-secondary mb-4 pb-3 border-b-2 border-accent">
                Departments
              </h3>
              <div className="space-y-3">
                {departments.map((dept, index) => (
                  <div key={index} className="flex justify-between items-center py-2 hover:bg-muted rounded-lg px-2 transition-colors cursor-pointer">
                    <span className="text-sm text-gray-700">{dept.name}</span>
                    <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-semibold">
                      {dept.count}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Main Content - Job Listings */}
          <div className="lg:col-span-3">
            {departments.map((dept, deptIndex) => {
              const deptJobs = jobs.filter(job => job.department === dept.name);
              if (deptJobs.length === 0) return null;

              return (
                <div key={deptIndex} className="mb-10">
                  <h2 className="text-xl font-bold text-secondary mb-1 pb-2 border-b-2 border-primary/20">
                    {dept.name}
                  </h2>
                  <div className="space-y-4 mt-6">
                    {deptJobs.map((job) => (
                      <Card key={job.id} hover>
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="text-base font-bold text-secondary mb-2">{job.title}</h3>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1 text-primary" />
                                {job.location}
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1 text-primary" />
                                {job.type}
                              </div>
                              <div className="flex items-center">
                                <Briefcase className="h-4 w-4 mr-1 text-primary" />
                                {job.department}
                              </div>
                            </div>
                            <p className="text-gray-700">{job.description}</p>
                          </div>
                          <div className="flex md:flex-col gap-2">
                            <button className="bg-muted hover:bg-gray-200 text-secondary px-4 py-2 rounded-lg transition-colors font-medium text-sm whitespace-nowrap">
                              More Info
                            </button>
                            <button className="bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-lg transition-colors font-medium text-sm flex items-center whitespace-nowrap">
                              Apply Now <ArrowRight className="h-4 w-4 ml-1" />
                            </button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Call to Action */}
            <Card>
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 rounded-lg text-center">
                <h3 className="text-xl font-bold text-secondary mb-2">Don't see a perfect fit?</h3>
                <p className="text-gray-700 mb-4">
                  We're always looking for talented individuals. Send us your resume and we'll keep you in mind for future opportunities.
                </p>
                <button className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg transition-colors font-medium">
                  Submit Your Resume
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

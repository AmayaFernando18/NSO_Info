import Breadcrumb from '../components/Breadcrumb';
import Card from '../components/Card';
import { ExternalLink, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface TenderNotice {
  id: string;
  tenderNo: string;
  publishedDate: string;
  closingDate: string;
  description: string;
  language: string;
  link: string;
}

const tenderNotices: TenderNotice[] = [
  {
    id: '1',
    tenderNo: '2026-01-22',
    publishedDate: 'January 22, 2026',
    closingDate: '',
    description: 'Weekly Notice of CEB Tenders published in Newspapers on 2026-01-22',
    language: 'English',
    link: '#'
  },
  {
    id: '2',
    tenderNo: '2026-01-15',
    publishedDate: 'January 15, 2026',
    closingDate: '',
    description: 'Weekly Notice of CEB Tenders published in Newspapers on 2026-01-15',
    language: 'English | Sinhala',
    link: '#'
  },
  {
    id: '3',
    tenderNo: '2026-01-08',
    publishedDate: 'January 08, 2026',
    closingDate: '',
    description: 'Weekly Notice of CEB Tenders published in Newspapers on 2026-01-08',
    language: 'English | Sinhala',
    link: '#'
  },
  {
    id: '4',
    tenderNo: '2025-12-25',
    publishedDate: 'December 25, 2025',
    closingDate: '',
    description: 'Weekly Notice of CEB Tenders published in Newspapers on 2025-12-25',
    language: 'English',
    link: '#'
  }
];

export default function TenderNoticesPage() {
  const [noticeExpanded, setNoticeExpanded] = useState(true);

  return (
    <div className="min-h-screen bg-base">
      {/* Hero Section */}
      <div className="relative h-[300px] bg-gradient-to-r from-secondary via-primary to-secondary overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/tender.jpg')] bg-cover bg-center opacity-50"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-secondary/60 to-primary/50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">TENDER NOTICES</h1>
          <Breadcrumb items={[{ label: 'TENDER NOTICES' }]} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Special Notice */}
        <Card>
          <button
            onClick={() => setNoticeExpanded(!noticeExpanded)}
            className="w-full flex items-center justify-between p-4 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors"
          >
            <span className="font-semibold text-left">
              SPECIAL NOTICE REGARDING SUBMITTING TYPE TEST REPORTS FOR CEB TENDERS.
            </span>
            <ChevronDown className={`h-5 w-5 transition-transform ${noticeExpanded ? 'rotate-180' : ''}`} />
          </button>
          
          {noticeExpanded && (
            <div className="mt-4 p-6 bg-gray-50 rounded-lg text-sm text-gray-700 space-y-3">
              <p>
                It is required to submit type test reports for the materials offered in tenders of CEB Distribution Divisions.
                As per the latest specifications, a bidder can provide type test reports issued by:
              </p>
              <p className="font-semibold">"Either</p>
              <p>(a) An accredited independent testing laboratory acceptable to the CEB or</p>
              <p>
                (b) An accredited independent testing laboratory acceptable to the CEB where the type tests have been witnessed by CEB or 
                reputed body acceptable to CEB"
              </p>
              <p>
                Furthermore, kindly note that from March 01, 2022 onwards, CEB will only accept type test reports from accredited 
                independent testing laboratories (criteria (a) above)
              </p>
              <p>
                Manufacturers who have not obtained type test reports from accredited independent testing laboratories may obtain the 
                same by March 01, 2022. Until such time manufacturers may offer type test reports issued by an accredited or independent 
                testing laboratory acceptable to the CEB where the type tests have been witnessed by CEB or a reputed independent body 
                acceptable to CEB (criteria (b) above)
              </p>
            </div>
          )}
        </Card>

        {/* Tender Notices Table */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-secondary mb-6">TENDER NOTICES</h2>
          
          <div className="bg-white rounded-lg shadow-soft overflow-hidden">
            {/* Table Header */}
            <div className="hidden md:grid md:grid-cols-12 gap-4 bg-primary text-white p-4 font-semibold text-sm">
              <div className="col-span-3">TENDER NO. / DETAIL</div>
              <div className="col-span-2">PUBLISHED DATE</div>
              <div className="col-span-2">TENDER CLOSING DATE</div>
              <div className="col-span-3">TENDER DESCRIPTION</div>
              <div className="col-span-1">DOWNLOAD FILES</div>
              <div className="col-span-1">EGP LINK</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-border">
              {tenderNotices.map((tender) => (
                <div key={tender.id} className="md:grid md:grid-cols-12 gap-4 p-4 hover:bg-muted/50 transition-colors">
                  {/* Mobile Layout */}
                  <div className="md:hidden space-y-2 mb-4">
                    <div className="font-semibold text-secondary">{tender.tenderNo}</div>
                    <div className="text-sm text-gray-600">Published: {tender.publishedDate}</div>
                    <div className="text-sm text-gray-700">{tender.description}</div>
                    <div className="flex gap-2">
                      <button className="bg-accent hover:bg-accent/90 text-white px-3 py-1 rounded text-sm flex items-center">
                        {tender.language}
                      </button>
                      <button className="bg-primary hover:bg-primary/90 text-white px-3 py-1 rounded text-sm flex items-center">
                        View Link <ExternalLink className="h-3 w-3 ml-1" />
                      </button>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden md:block md:col-span-3 font-semibold text-secondary">
                    CEB Tenders for Material, Construction and Services ({tender.tenderNo})
                  </div>
                  <div className="hidden md:block md:col-span-2 text-sm text-gray-700">
                    {tender.publishedDate}
                  </div>
                  <div className="hidden md:block md:col-span-2 text-sm text-gray-700">
                    {tender.closingDate || '—'}
                  </div>
                  <div className="hidden md:block md:col-span-3 text-sm text-gray-700">
                    {tender.description}
                  </div>
                  <div className="hidden md:flex md:col-span-1 items-center">
                    <button className="bg-accent hover:bg-accent/90 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors">
                      {tender.language}
                    </button>
                  </div>
                  <div className="hidden md:flex md:col-span-1 items-center">
                    <button className="text-primary hover:text-accent transition-colors">
                      <span className="text-sm font-medium underline">View Link</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination */}
          <div className="mt-6 flex justify-center">
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-white border border-border rounded hover:bg-muted transition-colors">
                Previous
              </button>
              <button className="px-4 py-2 bg-primary text-white rounded">1</button>
              <button className="px-4 py-2 bg-white border border-border rounded hover:bg-muted transition-colors">2</button>
              <button className="px-4 py-2 bg-white border border-border rounded hover:bg-muted transition-colors">3</button>
              <button className="px-4 py-2 bg-white border border-border rounded hover:bg-muted transition-colors">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

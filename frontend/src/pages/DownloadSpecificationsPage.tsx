import Breadcrumb from '../components/Breadcrumb';
import Card from '../components/Card';
import { FileText, Download, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const specifications = {
  insulatedConductors: [
    { title: 'LOW VOLTAGE INSULATED WIRES' },
    { title: 'LOW VOLTAGE SINGLE PHASE & THREE PHASE AERIAL BUNDLED CONDUCTORS' },
    { title: 'ACCESSORIES FOR LOW VOLTAGE AERIAL BUNDLED CONDUCTORS' }
  ],
  mediumVoltage: [
    { title: 'MEDIUM VOLTAGE AERIAL BUNDLED CONDUCTORS' },
    { title: 'ACCESSORIES FOR MEDIUM VOLTAGE AERIAL BUNDLED CONDUCTORS' }
  ],
  transformers: [
    { title: 'DISTRIBUTION TRANSFORMERS' },
    { title: 'POWER TRANSFORMERS' },
    { title: 'CURRENT TRANSFORMERS' },
    { title: 'VOLTAGE TRANSFORMERS' }
  ],
  equipment: [
    { title: 'RING MAIN UNITS' },
    { title: 'CIRCUIT BREAKERS' },
    { title: 'SWITCHGEAR EQUIPMENT' },
    { title: 'PROTECTION RELAYS' }
  ]
};

export default function DownloadSpecificationsPage() {
  const [noticeExpanded, setNoticeExpanded] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    insulatedConductors: true,
    mediumVoltage: false,
    transformers: false,
    equipment: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="min-h-screen bg-base">
      {/* Hero Section */}
      <div className="relative h-[400px] bg-gradient-to-r from-secondary via-primary to-secondary overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1568667256549-094345857637?w=1200')] bg-cover bg-center opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-secondary/90 to-primary/80"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">DOWNLOAD SPECIFICATIONS</h1>
          <Breadcrumb items={[{ label: 'DOWNLOAD SPECIFICATIONS' }]} />
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

        {/* Download Specifications */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-secondary mb-6">Download Specifications</h2>

          <div className="space-y-4">
            {/* Insulated Conductors & Accessories */}
            <Card>
              <button
                onClick={() => toggleSection('insulatedConductors')}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <ChevronRight className={`h-5 w-5 text-primary transition-transform ${expandedSections.insulatedConductors ? 'rotate-90' : ''}`} />
                  <span className="font-semibold text-secondary text-lg">INSULATED CONDUCTORS & ACCESSORIES</span>
                </div>
              </button>
              
              {expandedSections.insulatedConductors && (
                <div className="px-4 pb-4 space-y-2">
                  {specifications.insulatedConductors.map((spec, index) => (
                    <div key={index} className="flex items-center justify-between p-3 hover:bg-muted rounded-lg transition-colors border-l-4 border-primary">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <span className="text-sm text-gray-700">{spec.title}</span>
                      </div>
                      <button className="text-accent hover:text-accent/80 transition-colors">
                        <Download className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Medium Voltage */}
            <Card>
              <button
                onClick={() => toggleSection('mediumVoltage')}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <ChevronRight className={`h-5 w-5 text-primary transition-transform ${expandedSections.mediumVoltage ? 'rotate-90' : ''}`} />
                  <span className="font-semibold text-secondary text-lg">MEDIUM VOLTAGE CONDUCTORS</span>
                </div>
              </button>
              
              {expandedSections.mediumVoltage && (
                <div className="px-4 pb-4 space-y-2">
                  {specifications.mediumVoltage.map((spec, index) => (
                    <div key={index} className="flex items-center justify-between p-3 hover:bg-muted rounded-lg transition-colors border-l-4 border-primary">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <span className="text-sm text-gray-700">{spec.title}</span>
                      </div>
                      <button className="text-accent hover:text-accent/80 transition-colors">
                        <Download className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Transformers */}
            <Card>
              <button
                onClick={() => toggleSection('transformers')}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <ChevronRight className={`h-5 w-5 text-primary transition-transform ${expandedSections.transformers ? 'rotate-90' : ''}`} />
                  <span className="font-semibold text-secondary text-lg">TRANSFORMERS</span>
                </div>
              </button>
              
              {expandedSections.transformers && (
                <div className="px-4 pb-4 space-y-2">
                  {specifications.transformers.map((spec, index) => (
                    <div key={index} className="flex items-center justify-between p-3 hover:bg-muted rounded-lg transition-colors border-l-4 border-primary">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <span className="text-sm text-gray-700">{spec.title}</span>
                      </div>
                      <button className="text-accent hover:text-accent/80 transition-colors">
                        <Download className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Equipment */}
            <Card>
              <button
                onClick={() => toggleSection('equipment')}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <ChevronRight className={`h-5 w-5 text-primary transition-transform ${expandedSections.equipment ? 'rotate-90' : ''}`} />
                  <span className="font-semibold text-secondary text-lg">ELECTRICAL EQUIPMENT</span>
                </div>
              </button>
              
              {expandedSections.equipment && (
                <div className="px-4 pb-4 space-y-2">
                  {specifications.equipment.map((spec, index) => (
                    <div key={index} className="flex items-center justify-between p-3 hover:bg-muted rounded-lg transition-colors border-l-4 border-primary">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <span className="text-sm text-gray-700">{spec.title}</span>
                      </div>
                      <button className="text-accent hover:text-accent/80 transition-colors">
                        <Download className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

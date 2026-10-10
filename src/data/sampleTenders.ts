/**
 * Authentic Pre-Configured Civil Engineering Tenders & Draft Templates
 * Based on authentic Indian Government / CPWD / NHAI / State PWD tender schedules and standard bidding documents
 */

import { TenderDocument, TenderDraftTemplate, AppSettings } from '../types/tender';

export const SAMPLE_TENDERS: TenderDocument[] = [
  {
    id: 'tender-cpwd-delhi-2026',
    ownerUid: 'system-benchmark',
    nitNumber: 'CPWD/EE-CD-IV/NIT-041/2026-27',
    title: 'Construction of 7-Storey Sustainable Academic Block & 600-Capacity Auditorium at North Campus',
    authority: 'CPWD',
    issuingDepartment: 'Office of the Executive Engineer, Civil Division IV, CPWD, New Delhi',
    estimatedCost: 487500000, // ₹ 48.75 Cr
    currency: 'INR',
    emdAmount: 5875000, // ₹ 58.75 Lakhs
    tenderFee: 10000,
    bidSecurityType: 'Bank Guarantee',
    publicationDate: '2026-09-15',
    submissionDeadline: '2026-11-20',
    preBidMeetingDate: '2026-10-25',
    technicalBidOpeningDate: '2026-11-21',
    workLocation: 'North Campus Institutional Area, New Delhi - 110007',
    completionPeriodMonths: 18,
    defectLiabilityMonths: 36,
    status: 'In Review',
    pageCount: 148,
    uploadedAt: '2026-10-01',
    rawTextExcerpt: `NOTICE INVITING e-TENDER (NIT No. CPWD/EE-CD-IV/NIT-041/2026-27). The Executive Engineer, Civil Division IV, CPWD, on behalf of the President of India invites online percentage rate bids from approved and eligible contractors of CPWD in appropriate composite category for the work: Construction of 7-Storey Sustainable Academic Block & Auditorium. Estimated Cost: Rs. 48,75,00,000/-. EMD: Rs. 58,75,000/-. Time allowed: 18 Months. Pre-bid meeting on 25-10-2026 at Conference Room, Sewa Bhawan. Defect Liability Period: 36 Months from date of completion. GCC Clause 2 Liquidated damages applies at 1.0% per month of delay capped at 10%. Price adjustment under Clause 10CA and 10CC applicable for Cement, Reinforcement Steel, and POL based on Wholesale Price Index published by RBI.`,
    boqItems: [
      {
        id: 'boq-cpwd-01',
        itemNumber: '02.08.01',
        category: 'earthwork',
        description: 'Earth work in excavation by mechanical means (Hydraulic excavator) / manual means over areas (exceeding 30 cm in depth, 1.5 m in width as well as 10 sqm on plan) including getting out and disposal of surplus excavated earth lead up to 50 m and lift up to 1.5 m, as per directed by Engineer-in-Charge in all kinds of soil.',
        unit: 'cum',
        quantity: 14250,
        estimatedRate: 215.50,
        totalAmount: 3070875,
        specificationRef: 'CPWD DSR 2023 Item 2.8.1'
      },
      {
        id: 'boq-cpwd-02',
        itemNumber: '04.01.03',
        category: 'substructure_concrete',
        description: 'Providing and laying in position specified grade of reinforced cement concrete, excluding the cost of centering, shuttering, finishing and reinforcement - All work up to plinth level: 1:1.5:3 (1 cement : 1.5 coarse sand : 3 graded stone aggregate 20 mm nominal size).',
        unit: 'cum',
        quantity: 2840,
        estimatedRate: 6450.00,
        totalAmount: 18318000,
        specificationRef: 'CPWD DSR 2023 Item 4.1.3'
      },
      {
        id: 'boq-cpwd-03',
        itemNumber: '05.02.01',
        category: 'superstructure_rcc',
        description: 'Reinforced cement concrete work in columns, pillars, piers, abutments, posts and struts up to floor five level, excluding cost of centering, shuttering, finishing and reinforcement: Design Mix M-30 using 20 mm nominal size graded stone aggregate with micro-silica admixture.',
        unit: 'cum',
        quantity: 5120,
        estimatedRate: 8250.00,
        totalAmount: 42240000,
        specificationRef: 'CPWD DSR 2023 Item 5.2.1'
      },
      {
        id: 'boq-cpwd-04',
        itemNumber: '05.22.06',
        category: 'reinforcement_steel',
        description: 'Thermo-Mechanically Treated (TMT) steel bars Fe-500D or superior conforming to IS:1786 for RCC work, including straightening, cutting, bending, placing in position and binding with 18 gauge annealed black wire complete up to all floor levels.',
        unit: 'MT',
        quantity: 840,
        estimatedRate: 72400.00,
        totalAmount: 60816000,
        specificationRef: 'CPWD DSR 2023 Item 5.22.6'
      },
      {
        id: 'boq-cpwd-05',
        itemNumber: '06.01.02',
        category: 'brickwork_masonry',
        description: 'Brick work with common burnt clay F.P.S. (non modular) bricks of class designation 7.5 in foundation and plinth in: Cement mortar 1:6 (1 cement : 6 coarse sand) and Fly-ash AAC light-weight blocks in superstructure 200mm thick.',
        unit: 'cum',
        quantity: 3600,
        estimatedRate: 5850.00,
        totalAmount: 21060000,
        specificationRef: 'CPWD DSR 2023 Item 6.1.2'
      },
      {
        id: 'boq-cpwd-06',
        itemNumber: '11.03.01',
        category: 'flooring_paving',
        description: 'Providing and laying vitrified floor tiles in different sizes with water absorption less than 0.08% and conforming to IS:15622, laid on 20 mm thick cement mortar 1:4 (1 cement : 4 coarse sand), including grouting the joints with white cement and matching pigments.',
        unit: 'sqm',
        quantity: 12500,
        estimatedRate: 1420.00,
        totalAmount: 17750000,
        specificationRef: 'CPWD DSR 2023 Item 11.3.1'
      },
      {
        id: 'boq-cpwd-07',
        itemNumber: '10.02.01',
        category: 'structural_steel',
        description: 'Structural steel work riveted, bolted or welded in built up sections, trusses and framed work, including cutting, hoisting, fixing in position and applying a priming coat of approved steel primer, complete for auditorium long-span roof truss (IS:2062 Grade E250).',
        unit: 'MT',
        quantity: 210,
        estimatedRate: 88500.00,
        totalAmount: 18585000,
        specificationRef: 'CPWD DSR 2023 Item 10.2.1'
      },
      {
        id: 'boq-cpwd-08',
        itemNumber: '13.01.02',
        category: 'finishing_plastering',
        description: '12 mm cement plaster of mix: 1:4 (1 cement: 4 fine sand) on fair face of brick work / concrete walls including internal scaffolding, curing for 7 days, and finishing smoothly with acrylic putty and low-VOC emulsion paint.',
        unit: 'sqm',
        quantity: 34000,
        estimatedRate: 340.00,
        totalAmount: 11560000,
        specificationRef: 'CPWD DSR 2023 Item 13.1.2'
      }
    ],
    clauses: [
      {
        id: 'cl-cpwd-01',
        type: 'liquidated_damages',
        title: 'Compensation for Delay (Liquidated Damages)',
        articleRef: 'CPWD GCC Clause 2',
        rawExtract: 'If the contractor fails to maintain the required progress in terms of clause 5 or to complete the work and clear the site on or before the contract or extended date of completion, he shall, without prejudice to any other right or remedy available under the law to the Government on account of such breach, pay as agreed compensation the amount calculated at the rates stipulated below: Compensation for delay of work: 1.0% per month of delay to be computed on per day basis provided that total amount of compensation for delay shall not exceed 10% of the tendered value of work.',
        summary: 'Imposes 1.0% per month delayed penalty, capped at maximum 10% of total tendered value (₹ 4.875 Cr maximum contractual exposure).',
        riskLevel: 'critical',
        pageNumber: 14,
        detectedKeywords: ['liquidated damages', 'clause 2', 'compensation for delay', '1.0% per month', 'not exceed 10%'],
        recommendation: 'Establish bi-weekly Critical Path Method (CPM) tracking. File milestone extension requests before milestone expiry to avoid interim retention.'
      },
      {
        id: 'cl-cpwd-02',
        type: 'price_escalation',
        title: 'Price Adjustment for Materials & Labor (Clause 10CA & 10CC)',
        articleRef: 'CPWD GCC Clause 10CA & 10CC',
        rawExtract: 'If after submission of the tender, the price of materials specified in Schedule F increases/decreases beyond the base price, the contract amount shall accordingly be varied subject to the condition that such variation shall be calculated based on the Wholesale Price Index (WPI) as published by Ministry of Commerce and Industry. Clause 10CC shall be operative as the stipulated period of completion is 18 months (exceeds 12 months threshold).',
        summary: 'Material and labor price variation is protected under standard indices. Both 10CA (Cement, Steel, POL) and 10CC (Full project escalation index) are active.',
        riskLevel: 'standard',
        pageNumber: 27,
        detectedKeywords: ['clause 10ca', 'clause 10cc', 'wholesale price index', 'escalation', 'schedule f'],
        recommendation: 'Baseline indices of submission month must be recorded immediately in billing journal.'
      },
      {
        id: 'cl-cpwd-03',
        type: 'defect_liability',
        title: 'Defect Liability & Latent Defect Guarantee',
        articleRef: 'CPWD GCC Clause 17 & Special Conditions Cl. 4.1',
        rawExtract: 'If the contractor or his working people shall break, deface, injure or destroy any part of building, or if any damage shall happen to the work while in progress, or any defects, shrinkage or other faults appear within 36 months after a certificate final or otherwise of its completion, the contractor shall make the same good at his own expense. Retention money of 5% will be retained until expiration of this 36-month period.',
        summary: '36-month (3 years) Defect Liability Period with 5% security deposit retention (standard for green/institutional buildings).',
        riskLevel: 'attention',
        pageNumber: 39,
        detectedKeywords: ['defect liability period', '36 months', 'retention money', 'clause 17'],
        recommendation: 'Sub-contractor warranties (waterproofing, HVAC, structural glazing) must match 36-month duration.'
      },
      {
        id: 'cl-cpwd-04',
        type: 'mobilization_advance',
        title: 'Mobilization Advance & Plant Advance',
        articleRef: 'CPWD GCC Clause 10B(ii)',
        rawExtract: 'Mobilization advance not exceeding 10% of the tendered value may be given, if for by the contractor in writing within one month of the order to commence the work. In such a case, the contractor shall execute a Bank Guarantee Bond from a Scheduled Bank for the full amount of such advance. The advance shall bear simple interest at the rate of 10% per annum and shall be recovered in equal installments from running account bills.',
        summary: 'Contractor is entitled to 10% mobilization advance against unconditional Bank Guarantee at 10% simple annual interest.',
        riskLevel: 'standard',
        pageNumber: 22,
        detectedKeywords: ['mobilization advance', '10%', 'bank guarantee', 'clause 10b'],
        recommendation: 'Apply within 30 days of Letter of Acceptance (LoA) to optimize initial cash flow for equipment mobilization.'
      },
      {
        id: 'cl-cpwd-05',
        type: 'dispute_resolution',
        title: 'Settlement of Disputes & Arbitration',
        articleRef: 'CPWD GCC Clause 25',
        rawExtract: 'Except where otherwise provided in the contract, all questions and disputes relating to the meaning of the specifications, design, drawings and instructions shall be referred to Dispute Redressal Committee (DRC). If not resolved within 90 days, matter may be referred to sole arbitrator appointed by the Chief Engineer CPWD.',
        summary: 'Mandatory DRC escalation within 90 days prior to invoking Arbitration under the Indian Arbitration and Conciliation Act.',
        riskLevel: 'standard',
        pageNumber: 52,
        detectedKeywords: ['clause 25', 'dispute redressal committee', 'arbitration', 'chief engineer'],
        recommendation: 'Maintain exhaustive site obstacle registers signed by Resident Engineer to substantiate any claims.'
      }
    ],
    eligibility: [
      {
        id: 'el-cpwd-01',
        category: 'financial_turnover',
        title: 'Average Annual Financial Turnover',
        requirementText: 'The bidder should have achieved an average annual financial turnover of at least 50% of the estimated cost of work during the immediate last 3 consecutive financial years ending 31st March 2026.',
        extractedValue: '₹ 24.38 Cr / year required',
        thresholdValue: '₹ 24,37,50,000',
        mandatory: true,
        status: 'eligible',
        citationPage: 8
      },
      {
        id: 'el-cpwd-02',
        category: 'past_experience',
        title: 'Similar Work Completion Experience',
        requirementText: 'Experience of having successfully completed similar institutional/commercial building works during last 7 years: Three similar works each costing not less than 40% (₹ 19.50 Cr), OR Two similar works each costing not less than 60% (₹ 29.25 Cr), OR One similar work costing not less than 80% (₹ 39.00 Cr).',
        extractedValue: 'One work of ₹ 39 Cr or Two of ₹ 29.25 Cr',
        thresholdValue: '₹ 39,00,000 to ₹ 39,00,00,000',
        mandatory: true,
        status: 'eligible',
        citationPage: 9
      },
      {
        id: 'el-cpwd-03',
        category: 'bid_capacity',
        title: 'Available Bid Capacity Formulation',
        requirementText: 'Available Bid Capacity = (2 * A * N) - B must be greater than the estimated cost of tender (₹ 48.75 Cr).',
        extractedValue: 'Calculated from audited balance sheets',
        thresholdValue: '> ₹ 48.75 Cr',
        mandatory: true,
        status: 'eligible',
        citationPage: 11
      },
      {
        id: 'el-cpwd-04',
        category: 'solvency',
        title: 'Bank Solvency Certificate',
        requirementText: 'Solvency certificate from a Scheduled Bank of an amount equal to 40% of the estimated cost of work (₹ 19.50 Cr) issued within last 6 months.',
        extractedValue: '₹ 19.50 Cr solvency certificate',
        thresholdValue: '₹ 19,50,00,000',
        mandatory: true,
        status: 'review_needed',
        citationPage: 12
      }
    ],
    deadlines: [
      {
        id: 'dl-cpwd-01',
        milestone: 'Pre-Bid Meeting & Site Inspection',
        date: '2026-10-25',
        time: '11:00 AM IST',
        type: 'prebid',
        status: 'upcoming',
        notes: 'Sewa Bhawan Conference Hall or Cisco WebEx link. Submit technical queries in advance.',
        location: 'New Delhi'
      },
      {
        id: 'dl-cpwd-02',
        milestone: 'Online Bid Submission Deadline (e-Procure)',
        date: '2026-11-20',
        time: '03:00 PM IST',
        type: 'submission',
        status: 'upcoming',
        notes: 'Technical package and scanned copy of EMD instrument to be uploaded before 15:00 hrs.',
        location: 'CPWD Central Public Procurement Portal'
      },
      {
        id: 'dl-cpwd-03',
        milestone: 'Original EMD & Document Hardcopy Submission',
        date: '2026-11-20',
        time: '02:30 PM IST',
        type: 'emd',
        status: 'upcoming',
        notes: 'Physical BG / FDR copy to be deposited in tender box at Executive Engineer Office.',
        location: 'Room 204, CD-IV, New Delhi'
      },
      {
        id: 'dl-cpwd-04',
        milestone: 'Technical Bid Opening',
        date: '2026-11-21',
        time: '03:30 PM IST',
        type: 'opening',
        status: 'upcoming',
        notes: 'Online opening of Envelope-I (Eligibility & Technical Criteria) in presence of bidders.',
        location: 'e-Tender Room'
      }
    ]
  },
  {
    id: 'tender-nhai-nh48-2026',
    ownerUid: 'system-benchmark',
    nitNumber: 'NHAI/RO-BLR/2026/NH48-PKG3/EPC',
    title: 'Four-Laning of NH-48 Section Km 140.000 to Km 175.000 with Pavement Quality Concrete (PQC) & Grade Separators',
    authority: 'NHAI',
    issuingDepartment: 'Regional Office Bengaluru, National Highways Authority of India',
    estimatedCost: 1842000000, // ₹ 184.20 Cr
    currency: 'INR',
    emdAmount: 18420000, // ₹ 1.842 Cr
    tenderFee: 25000,
    bidSecurityType: 'Bank Guarantee',
    publicationDate: '2026-09-01',
    submissionDeadline: '2026-11-10',
    preBidMeetingDate: '2026-10-14',
    technicalBidOpeningDate: '2026-11-11',
    workLocation: 'Karnataka - Tamil Nadu Border Corridor, NH-48',
    completionPeriodMonths: 24,
    defectLiabilityMonths: 60,
    status: 'In Review',
    pageCount: 380,
    uploadedAt: '2026-10-02',
    rawTextExcerpt: `NATIONAL HIGHWAYS AUTHORITY OF INDIA (Ministry of Road Transport and Highways). NOTICE INVITING BID (NIT No. NHAI/RO-BLR/2026/NH48-PKG3/EPC). Four-Laning of NH-48 Section Km 140 to Km 175 on EPC (Engineering, Procurement, and Construction) Contract Mode. Estimated Project Cost: Rs. 184.20 Crores. Bid Security: Rs. 1.842 Crores. Construction Period: 730 days (24 Months). Maintenance / Defect Liability Period: 5 Years (60 Months). Clause 10.3 Liquidated Damages for delay @ 0.05% of Contract Price per day of delay, max 10%. Mobilization advance of 10% against Bank Guarantee at Bank Rate + 3%.`,
    boqItems: [
      {
        id: 'boq-nhai-01',
        itemNumber: '301.1',
        category: 'earthwork',
        description: 'Excavation in roadway in all types of soil including cutting, trimming bottom and side slopes, transporting and utilizing in embankment or disposing of surplus with 1000m lead.',
        unit: 'cum',
        quantity: 185000,
        estimatedRate: 180.00,
        totalAmount: 33300000,
        specificationRef: 'MoRTH Section 301'
      },
      {
        id: 'boq-nhai-02',
        itemNumber: '401.1',
        category: 'earthwork',
        description: 'Construction of Sub-base with Granular Material (Granular Sub-Base GSB Grade-I) conforming to table 400-1 spreading in uniform layer with motor grader, watering and compacting with vibratory roller.',
        unit: 'cum',
        quantity: 94000,
        estimatedRate: 1450.00,
        totalAmount: 136300000,
        specificationRef: 'MoRTH Section 401'
      },
      {
        id: 'boq-nhai-03',
        itemNumber: '602.1',
        category: 'substructure_concrete',
        description: 'Dry Lean Concrete (DLC) sub-base over granular sub-base with coarse and fine aggregate conforming to IS:383 with 150 mm thickness, compacted to design density.',
        unit: 'cum',
        quantity: 52000,
        estimatedRate: 3850.00,
        totalAmount: 200200000,
        specificationRef: 'MoRTH Section 601'
      },
      {
        id: 'boq-nhai-04',
        itemNumber: '602.2',
        category: 'superstructure_rcc',
        description: 'Pavement Quality Concrete (PQC) M-40 flexural strength 4.5 MPa with slip form paver including dowel bars, tie bars, contraction joints, longitudinal joints, curing and texturing.',
        unit: 'cum',
        quantity: 98000,
        estimatedRate: 6800.00,
        totalAmount: 666400000,
        specificationRef: 'MoRTH Section 602'
      },
      {
        id: 'boq-nhai-05',
        itemNumber: '1100.1',
        category: 'superstructure_rcc',
        description: 'Cast in place reinforced cement concrete M-35 in substructure of 2 Flyovers, 4 Vehicular Underpasses (VUP), piers, pier caps, abutments and dirt walls.',
        unit: 'cum',
        quantity: 26000,
        estimatedRate: 8500.00,
        totalAmount: 221000000,
        specificationRef: 'MoRTH Section 1100'
      },
      {
        id: 'boq-nhai-06',
        itemNumber: '1600.1',
        category: 'reinforcement_steel',
        description: 'High yield strength deformed steel bars (TMT Fe 500D) conforming to IS:1786 for RCC bridge elements, flyovers and retaining walls.',
        unit: 'MT',
        quantity: 4200,
        estimatedRate: 74500.00,
        totalAmount: 312900000,
        specificationRef: 'MoRTH Section 1600'
      }
    ],
    clauses: [
      {
        id: 'cl-nhai-01',
        type: 'liquidated_damages',
        title: 'Damages for Delay in Completion',
        articleRef: 'EPC Contract Clause 10.3',
        rawExtract: 'If the Contractor fails to achieve Scheduled Completion Date, the Contractor shall pay to the Authority as damages an amount calculated at the rate of 0.05% of the Contract Price for each day of delay until Completion Certificate is achieved, subject to maximum damages not exceeding 10% of Contract Price.',
        summary: 'Daily penalty of 0.05% per day (₹ 9.21 Lakhs/day) capped at ₹ 18.42 Cr maximum.',
        riskLevel: 'critical',
        pageNumber: 44,
        detectedKeywords: ['damages for delay', 'clause 10.3', '0.05% per day', '10% of contract price'],
        recommendation: 'Track milestone 1 (20% physical progress at 180 days) and milestone 2 (55% at 360 days) to prevent interim damages.'
      },
      {
        id: 'cl-nhai-02',
        type: 'defect_liability',
        title: 'Defect Liability Period for Rigid Pavement & Structures',
        articleRef: 'EPC Contract Clause 17.1',
        rawExtract: 'The Contractor shall be responsible for remedying at his own cost any defect in Pavement Quality Concrete and Highway Structures for a period of 5 (Five) Years from the date of the Provisional Certificate.',
        summary: '5 Years (60 months) extensive maintenance liability for concrete highway pavement and flyovers.',
        riskLevel: 'critical',
        pageNumber: 78,
        detectedKeywords: ['defect liability period', '5 years', 'pavement quality concrete', 'structures'],
        recommendation: 'Rigorous joint sealing and high-grade curing compliance required during construction.'
      }
    ],
    eligibility: [
      {
        id: 'el-nhai-01',
        category: 'past_experience',
        title: 'Technical Capacity - Highway Construction Experience',
        requirementText: 'Threshold Technical Capacity of at least ₹ 368.40 Cr (200% of Estimated Project Cost) in eligible projects over past 5 financial years.',
        extractedValue: '₹ 368.40 Cr eligible highway experience',
        thresholdValue: '₹ 368,40,00,000',
        mandatory: true,
        status: 'eligible',
        citationPage: 16
      },
      {
        id: 'el-nhai-02',
        category: 'financial_turnover',
        title: 'Financial Capacity - Net Worth Requirement',
        requirementText: 'Minimum Net Worth of ₹ 92.10 Cr (50% of Estimated Project Cost) at the close of preceding financial year.',
        extractedValue: '₹ 92.10 Cr net worth certificate',
        thresholdValue: '₹ 92,10,00,000',
        mandatory: true,
        status: 'eligible',
        citationPage: 18
      }
    ],
    deadlines: [
      {
        id: 'dl-nhai-01',
        milestone: 'Pre-Bid Clarification Meeting',
        date: '2026-10-14',
        time: '11:30 AM IST',
        type: 'prebid',
        status: 'upcoming',
        notes: 'NHAI Regional Office Bengaluru / Video Conference. Queries to be submitted by 2026-10-12.',
        location: 'Bengaluru RO'
      },
      {
        id: 'dl-nhai-02',
        milestone: 'Online Bid Submission Deadline',
        date: '2026-11-10',
        time: '11:00 AM IST',
        type: 'submission',
        status: 'upcoming',
        notes: 'Bid upload on e-procurement portal along with PoS verification.',
        location: 'Central eProcurement'
      }
    ]
  },
  {
    id: 'tender-kuidfc-stp-2026',
    ownerUid: 'system-benchmark',
    nitNumber: 'KUIDFC/WSS-2026/09/STP-SBR',
    title: 'Design, Build & Operate 20 MLD Sewage Treatment Plant with Sequential Batch Reactor (SBR) Technology and Underground Sewer Network',
    authority: 'Municipal Corp',
    issuingDepartment: 'Karnataka Urban Infrastructure Development and Finance Corporation',
    estimatedCost: 324000000, // ₹ 32.40 Cr
    currency: 'INR',
    emdAmount: 3240000, // ₹ 32.40 Lakhs
    tenderFee: 15000,
    bidSecurityType: 'Bank Guarantee',
    publicationDate: '2026-09-20',
    submissionDeadline: '2026-11-28',
    preBidMeetingDate: '2026-10-30',
    technicalBidOpeningDate: '2026-11-29',
    workLocation: 'Shimoga Urban Drainage Zone, Karnataka',
    completionPeriodMonths: 15,
    defectLiabilityMonths: 24,
    status: 'In Review',
    pageCount: 195,
    uploadedAt: '2026-10-04',
    rawTextExcerpt: `KUIDFC INVITES TENDERS for Design, Construction, Commissioning of 20 MLD STP based on SBR Technology and 45 km DWC pipe underground network with 5 years O&M. Total estimated cost Rs. 32.40 Crores. EMD Rs. 32.40 Lakhs. Completion period 15 months. DLP 24 months followed by Comprehensive O&M.`,
    boqItems: [
      {
        id: 'boq-stp-01',
        itemNumber: 'STP-01',
        category: 'substructure_concrete',
        description: 'Construction of Inlet Chamber, Screen Channels, Grit Separator basins in water retaining M-30 RCC with waterproofing compound confirming to IS:3370.',
        unit: 'cum',
        quantity: 1850,
        estimatedRate: 9800.00,
        totalAmount: 18130000,
        specificationRef: 'KUIDFC Technical Spec 4.1'
      },
      {
        id: 'boq-stp-02',
        itemNumber: 'STP-02',
        category: 'superstructure_rcc',
        description: 'Construction of SBR Basins (4 Nos) with water depth 5.5 m including baffle walls, decanter support pedestals in M-35 Grade RCC conforming to IS:3370 liquid retaining standards.',
        unit: 'cum',
        quantity: 4200,
        estimatedRate: 10400.00,
        totalAmount: 43680000,
        specificationRef: 'KUIDFC Technical Spec 4.3'
      },
      {
        id: 'boq-stp-03',
        itemNumber: 'NET-01',
        category: 'plumbing_sanitary',
        description: 'Laying, jointing and testing of Double Wall Corrugated (DWC) HDPE pipes 300 mm to 600 mm dia for underground sewerage network with granular bedding.',
        unit: 'rmt',
        quantity: 45000,
        estimatedRate: 2850.00,
        totalAmount: 128250000,
        specificationRef: 'CPHEEO Sewerage Manual'
      }
    ],
    clauses: [
      {
        id: 'cl-stp-01',
        type: 'liquidated_damages',
        title: 'Liquidated Damages for Delayed Commissioning',
        articleRef: 'General Conditions Clause 41',
        rawExtract: 'Liquidated damages for failure to commission within 15 months shall be 0.5% per week of delay or part thereof, subject to maximum of 10% of contract price.',
        summary: '0.5% per week penalty up to 10% limit.',
        riskLevel: 'critical',
        pageNumber: 31,
        detectedKeywords: ['0.5% per week', 'delay', 'commissioning'],
        recommendation: 'Prioritize electromechanical equipment procurement early to prevent commissioning bottlenecks.'
      }
    ],
    eligibility: [
      {
        id: 'el-stp-01',
        category: 'past_experience',
        title: 'STP Technology Execution Experience',
        requirementText: 'Completed at least one SBR technology STP of capacity not less than 15 MLD in the last 7 years in Government / PSU sector.',
        extractedValue: '15 MLD SBR STP reference required',
        thresholdValue: '15 MLD',
        mandatory: true,
        status: 'eligible',
        citationPage: 14
      }
    ],
    deadlines: [
      {
        id: 'dl-stp-01',
        milestone: 'Pre-Bid Clarification Meeting',
        date: '2026-10-30',
        time: '02:30 PM IST',
        type: 'prebid',
        status: 'upcoming',
        notes: 'KUIDFC Head Office, Bengaluru.',
        location: 'Bengaluru'
      },
      {
        id: 'dl-stp-02',
        milestone: 'Bid Submission Cutoff',
        date: '2026-11-28',
        time: '05:00 PM IST',
        type: 'submission',
        status: 'upcoming',
        notes: 'e-Procurement portal Karnataka.',
        location: 'e-Portal'
      }
    ]
  }
];

export const SAMPLE_DRAFT_TEMPLATES: TenderDraftTemplate[] = [
  {
    id: 'tmpl-prebid-query',
    name: 'Pre-Bid Meeting Technical Query Submission Letter',
    category: 'prebid_query',
    description: 'Formal template to submit technical clarifications, BOQ ambiguities, or clause relaxation requests to the tendering authority before pre-bid cutoff.',
    requiredFields: ['Authority Name', 'Tender NIT No.', 'Work Name', 'Clause Reference', 'Requested Clarification'],
    templateBody: `To,
The Executive Engineer / Superintending Engineer,
{{AUTHORITY_NAME}}
{{ISSUING_OFFICE}}

Subject: Submission of Pre-Bid Queries in respect of Tender: {{WORK_NAME}} (NIT No: {{NIT_NUMBER}})

Dear Sir/Madam,

With reference to the Notice Inviting Tender for the subject work, we have thoroughly reviewed the Tender Document, Technical Specifications, and Bill of Quantities (BOQ).

In accordance with the bidding instructions, we hereby submit the following pre-bid queries and clarifications for your kind consideration during the upcoming Pre-Bid Meeting:

Query 1:
- Tender Document Volume / Section: {{CLAUSE_REF}}
- Page Number: {{PAGE_NUMBER}}
- Existing Tender Provision:
  "{{EXISTING_TEXT}}"
- Ambiguity / Technical Observation:
  {{OBSERVATION_TEXT}}
- Clarification / Modification Requested by Bidder:
  {{REQUESTED_MODIFICATION}}

We request that the above points may please be clarified and incorporated in the forthcoming Pre-Bid Minutes and Addendum / Corrigendum to facilitate competitive and transparent bidding.

Thanking you,

Yours faithfully,
For {{COMPANY_NAME}}

Authorized Signatory
Name: {{SIGNATORY_NAME}}
Designation: {{SIGNATORY_DESIGNATION}}
Contact: {{SIGNATORY_CONTACT}}`
  },
  {
    id: 'tmpl-covering-letter',
    name: 'Technical Bid Covering Letter (Envelope-A / Packet-1)',
    category: 'covering_letter',
    description: 'Official submission letter accompanying the technical bid, confirming unconditional acceptance of tender terms and listing submitted qualification documents.',
    requiredFields: ['Authority Name', 'NIT Number', 'Work Name', 'EMD Details', 'Turnover Figures'],
    templateBody: `To,
{{AUTHORITY_NAME}},
{{ISSUING_OFFICE}}

Subject: Submission of Technical Bid for: {{WORK_NAME}}
Reference: Tender Notice / NIT No: {{NIT_NUMBER}}

Dear Sir/Madam,

1. Having examined the Invitation for Bids, Conditions of Contract, Technical Specifications, Drawings, and Bill of Quantities for the execution of the subject work, we, the undersigned, offer to execute and complete the said works in conformity with the said bidding documents.

2. We confirm that we have submitted the Earnest Money Deposit (EMD) of {{EMD_AMOUNT}} in the form of {{EMD_TYPE}} bearing No. {{EMD_REF_NO}} dated {{EMD_DATE}} drawn on {{BANK_NAME}}, in accordance with the Tender stipulations.

3. We hereby certify that:
   a) We have not made any misleading or false representations in the forms, statements, and attachments submitted in proof of the qualification requirements.
   b) We have unconditional acceptance of all terms, conditions, and specifications of the Tender Document without any commercial or technical deviation.
   c) Our Available Bid Capacity calculated as per CPWD / NHAI standard formula exceeds the estimated cost of the work.

4. We enclose herewith all supporting certificates for Financial Turnover, Solvency Certificate, Similar Work Experience, GST Registration, and Key Personnel resumes as required in Packet-1.

Dated this _____ day of ____________ 2026.

Signature: __________________________
In the capacity of: Authorized Signatory
Duly authorized to sign bid for and on behalf of: {{COMPANY_NAME}}`
  },
  {
    id: 'tmpl-emd-undertaking',
    name: 'Bid Security / EMD Exemption Undertaking (MSME / NSIC)',
    category: 'emd_undertaking',
    description: 'Formal declaration regarding exemption of Earnest Money Deposit under Public Procurement Policy for MSEs / Startups or Bank Guarantee validity commitment.',
    requiredFields: ['Enterprise Name', 'Udyam Registration No.', 'NIT No.', 'Authority Name'],
    templateBody: `UNDERTAKING FOR EARNEST MONEY DEPOSIT / BID SECURITY

Ref: Tender NIT No: {{NIT_NUMBER}}
Work: {{WORK_NAME}}

I / We, the undersigned, on behalf of M/s {{COMPANY_NAME}}, hereby declare that:

1. We are registered as a Micro / Small Enterprise under Udyam Registration No. {{UDYAM_REG_NO}} valid under Category {{CATEGORY_CLASS}}.
2. In accordance with Rule 170 of General Financial Rules (GFR) 2017 and Government Public Procurement Policy, we claim exemption from payment of Earnest Money Deposit (EMD).
3. We hereby undertake that if we withdraw or modify our bid during the period of bid validity specified in the tender document, or if we are awarded the contract and fail to sign the agreement or fail to submit a performance security before the deadline defined in request for bid document, we shall be suspended for the period of 2 (Two) years from being eligible to submit bids for contracts with {{AUTHORITY_NAME}}.

Date: ______________
Place: _____________

Authorized Signatory
Seal of Company`
  },
  {
    id: 'tmpl-deviation-statement',
    name: 'Schedule of Technical & Commercial Deviations',
    category: 'deviation_statement',
    description: 'Nil-Deviation or explicit deviation statement required by Indian government civil engineering tenders.',
    requiredFields: ['Company Name', 'NIT Number', 'Deviation List'],
    templateBody: `SCHEDULE OF DEVIATIONS (NIL DEVIATION STATEMENT)

Tender Reference: {{NIT_NUMBER}}
Name of Work: {{WORK_NAME}}
Bidder Name: {{COMPANY_NAME}}

This is to certify that:

[ X ] NIL DEVIATION CERTIFICATE:
We hereby confirm that our bid is in 100% compliance with all technical specifications, general conditions of contract (GCC), special conditions of contract (SCC), and tender drawings. There is NIL Deviation (either technical or commercial) in our proposal.

Any remarks, comments, or conditions mentioned elsewhere in our submission that conflict with the tender stipulations shall be treated as null and void.

Authorized Signatory
For {{COMPANY_NAME}}
Date: _______________`
  }
];

export const DEFAULT_SETTINGS: AppSettings = {
  organizationName: 'Shree Infra & Civil Engineering Projects Pvt Ltd',
  contractorLicenseClass: 'Class-I Super Grade (Composite Civil)',
  gstin: '07AAACS1429B1Z8',
  defaultCurrency: 'INR',
  measurementStandard: 'CPWD DSR',
  defaultContingencyPercent: 3.5,
  defaultMarginPercent: 12.0,
  defaultGstPercent: 18.0,
  turnoverLast3YearsAvg: 585000000, // ₹ 58.50 Cr average
  maxBidCapacity: 1250000000 // ₹ 125 Cr
};

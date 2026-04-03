import express from 'express'

const router = express.Router()

const SCHEMES = [
  { id: 'pm-kisan', name: 'PM-KISAN', description: 'Direct income support of ₹6,000 per year to farmer families across India.', category: 'Agriculture', amount: '₹6,000/year', ministry: 'Ministry of Agriculture', eligibility: ['Farmer', 'Land Owner'], documents: ['Aadhaar Card', 'Land Records', 'Bank Account'], deadline: '2024-12-31' },
  { id: 'pm-awas', name: 'PM Awas Yojana', description: 'Affordable housing scheme providing financial assistance to urban and rural poor.', category: 'Housing', amount: '₹2.5 Lakh', ministry: 'Ministry of Housing', eligibility: ['BPL Family', 'No Pucca House'], documents: ['Aadhaar Card', 'Income Certificate', 'Address Proof'], deadline: '2024-03-31' },
  { id: 'nsp', name: 'National Scholarship Portal', description: 'Merit and means-based scholarships for students from minority communities.', category: 'Education', amount: 'Up to ₹25,000/year', ministry: 'Ministry of Education', eligibility: ['Student', 'Annual Income < ₹2 Lakh'], documents: ['Aadhaar Card', 'Mark Sheet', 'Income Certificate'], deadline: '2024-10-31' },
  { id: 'mudra', name: 'PM MUDRA Yojana', description: 'Micro-finance loans up to ₹10 Lakh for small businesses and entrepreneurs.', category: 'Business', amount: 'Up to ₹10 Lakh', ministry: 'Ministry of Finance', eligibility: ['Small Business Owner', 'Self-Employed'], documents: ['Aadhaar Card', 'Business Plan', 'Bank Statement'], deadline: '2024-12-31' },
  { id: 'ujjwala', name: 'PM Ujjwala Yojana', description: 'Free LPG connections to women from Below Poverty Line households.', category: 'Women', amount: 'Free LPG Connection', ministry: 'Ministry of Petroleum', eligibility: ['Women', 'BPL Household'], documents: ['Aadhaar Card', 'BPL Card', 'Bank Account'], deadline: '2024-09-30' },
  { id: 'ayushman', name: 'Ayushman Bharat', description: 'Health insurance coverage of ₹5 Lakh per family per year.', category: 'Health', amount: '₹5 Lakh/year', ministry: 'Ministry of Health', eligibility: ['SECC Listed Family'], documents: ['Aadhaar Card', 'SECC Certificate', 'Ration Card'], deadline: 'Ongoing' },
]

router.get('/', (req, res) => {
  const { category, search } = req.query
  let results = SCHEMES
  if (category && category !== 'All') results = results.filter(s => s.category === category)
  if (search) {
    const q = search.toLowerCase()
    results = results.filter(s => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q))
  }
  res.json({ schemes: results, total: results.length })
})

router.get('/:id', (req, res) => {
  const scheme = SCHEMES.find(s => s.id === req.params.id)
  if (!scheme) return res.status(404).json({ error: 'Scheme not found' })
  res.json(scheme)
})

export default router
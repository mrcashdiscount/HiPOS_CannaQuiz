const GAS_URL = 'https://script.google.com/macros/s/AKfycbyMS50o6pvgjd294q4HjnZl_0GeOJvEIHNqj9fkxHljJsHayRKPyZPcN9ghjgFe7sCWFw/exec';
let currentStep = 1;

function updateProgress() {
  const pct = (currentStep / 3) * 100;
  document.getElementById('progressBar').style.width = pct + '%';
}

function nextStep(step) {
  if (!validateCurrentStep(step)) return;
  document.querySelector(`[data-step="${step}"]`).classList.remove('active');
  document.querySelector(`[data-step="${step+1}"]`).classList.add('active');
  currentStep++;
  updateProgress();
}

function prevStep(step) {
  document.querySelector(`[data-step="${step}"]`).classList.remove('active');
  document.querySelector(`[data-step="${step-1}"]`).classList.add('active');
  currentStep--;
  updateProgress();
}

function validateCurrentStep(step) {
  const container = document.querySelector(`[data-step="${step}"]`);
  let valid = true;

  container.querySelectorAll('[required]').forEach(el => {
    if (!el.value.trim()) {
      el.classList.add('is-invalid');
      valid = false;
    } else {
      el.classList.remove('is-invalid');
    }
  });

  if (step === 2) {
    const checks = container.querySelectorAll('input[name="paymentMethods"]:checked');
    if (checks.length === 0) {
      alert("Please select at least one payment method.");
      valid = false;
    }
  }

  return valid;
}

function updateSegmentKey() {
  const pain = document.querySelector('[name="biggestPainPoint"]').value;
  const map = {
    'High processing fees eating into profits': 'fee-conscious',
    'Frequent account closures/instability': 'compliance-risk',
    'Limited payment options for customers': 'growth-focused',
    'Cash management and security concerns': 'compliance-risk',
    'Compliance and reporting difficulties': 'compliance-risk',
    'Customer complaints about payment options': 'growth-focused',
    'No current payment processing solution': 'growth-focused'
  };
  document.getElementById('segmentKey').value = map[pain] || 'general';
}

function generateReviewSummary() {
  const form = document.getElementById('quizForm');
  const data = new FormData(form);
  let html = '<div class="row g-3">';

  const sections = [
    {title: 'Personal', fields: ['fullName','businessName','businessEmail','cellPhone']},
    {title: 'Business', fields: ['businessStage','primaryBusinessType']},
    {title: 'Payments', fields: ['paymentMethods','biggestPainPoint','bankingSituation','monthlyVolume']},
    {title: 'Operations & Goals', fields: ['posSystem','complianceStress','growthGoals','biggestWorry','decisionTimeline']}
  ];

  sections.forEach(sec => {
    html += `<div class="col-md-6"><div class="card border shadow-sm h-100"><div class="card-header bg-light"><strong>${sec.title}</strong></div><div class="card-body">`;
    sec.fields.forEach(f => {
      let val = data.getAll(f);
      if (f === 'paymentMethods') val = val.join(', ');
      html += `<p><strong>${f.replace(/([A-Z])/g,' $1').trim()}:</strong> ${val || '—'}</p>`;
    });
    html += '</div></div></div>';
  });

  html += '</div>';
  document.getElementById('reviewSummary').innerHTML = html;
}

document.getElementById('quizForm').addEventListener('submit', async e => {
  e.preventDefault();
  if (currentStep !== 3) return alert('Please complete all steps.');

  generateReviewSummary();

  const loading = document.getElementById('loading');
  loading.classList.remove('d-none');

  const formData = new FormData(e.target);
  const params = new URLSearchParams(formData);   // ← this handles multiple values correctly

  try {
    const resp = await fetch(GAS_URL, { method: 'POST', body: params });
    const text = await resp.text();

    loading.classList.add('d-none');

    if (text === 'SUCCESS') {
      new bootstrap.Modal(document.getElementById('successModal')).show();
      e.target.reset();
      currentStep = 1;
      updateProgress();
      document.querySelector('[data-step="1"]').classList.add('active');
    } else {
      alert('Submission error: ' + text);
    }
  } catch (err) {
    loading.classList.add('d-none');
    alert('Network error – please try again.');
    console.error(err);
  }
});

// GA
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'GA_MEASUREMENT_ID');
